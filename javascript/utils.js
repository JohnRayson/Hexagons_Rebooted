// hang everything off a global variable, if theres already an object called utils use that
// duplicate functions / variables might therefore behave in an unexpected manner depending on load order
var utils = utils || {};

// add the no-close style (this hides the close icon on dialogs - jQuery UI recommended way of doing it. http://api.jqueryui.com/dialog/
var head = document.getElementsByTagName('head')[0];
var styles = document.createElement("style");
styles.innerHTML = ".no-close .ui-dialog-titlebar-close { display: none; } "
                 + ".utils-centre { text-align: center !important; margin-left: auto !important; margin-right: auto !important; }"
                 + ".utils-plain-list { list-style-type:none; padding: 0px; }"
; // on this line so its easy to add new ones without accidentally screwing it up
head.appendChild(styles);

utils.require = {
    jQuery: { type: "script", dependent: null, name: "jQuery", url: "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.0/jquery.min.js", check: function () { return window.jQuery; }, state: "pending" },
    jQueryUI: { type: "script", dependent: "jQuery", name: "jQueryUI", url: "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js", check: function () { return window.jQuery && window.jQuery.ui; }, state: "pending" },
    moment: { type: "script", dependent: null, name: "moment", url: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js", check: function () { return window.moment; }, state: "pending" },
    toastr: { type: "script", dependent: "jQuery", name: "toastr", url: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js", check: function () { return window.jQuery && window.toastr; }, state: "pending" }
}
utils.initilizeComplete = null;
utils.ready = function (func)
{
    utils.initilizeComplete = func;
}
// declared before checking the dependencies - so these need to not be dependent on anything
// http://stackoverflow.com/a/950146
utils.loadExternal = function (url, type, callback)
{
    var head = document.getElementsByTagName('head')[0];
    var external;

    if (type == "stylesheet")
    {
        external = document.createElement("link");
        external.rel = 'stylesheet';
        external.type = 'text/css';
        external.href = url;
    }
    else
    {
        external = document.createElement("script");
        external.type = 'text/javascript';
        external.src = url;
    }

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    external.onreadystatechange = callback;
    external.onload = callback;

    // Fire the loading
    head.appendChild(external);
}
// create a UUID
// http://stackoverflow.com/a/8809472
utils.createUUID = function ()
{
    var d = new Date().getTime();
    if (window.performance && typeof window.performance.now === "function")
    {
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c)
    {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
// holder for page variables that dont really sit anywhere else
utils.vars = {};
utils.set = function (key, value, fixed)
{
    // set it if a.) it doesn't exist OR b.) its not fixed
    if (!utils.vars[key] || !utils.vars[key].fixed)
    {
        utils.vars[key] = { value: value, fixed: (fixed || false) }
        return true;
    }
    // either we passed in junk or tried to set a fixed var
    return false;
}
utils.get = function (key, info)
{
    // just get the value
    if (utils.vars[key] && !info)
        return utils.vars[key].value;
    // get the whole schebang
    if (info)
        return utils.vars[key] || false;
    // not found
    return false;
}
// store things locally
utils.localStorage = function (appId, persist)
{
    var _storage = (persist ? localStorage : sessionStorage);
    var _appId = appId + "__";

    this.getAppId = function ()
    {
        return _appId;
    }

    this.set = function (name, value)
    {
        name = _appId + name;
        _storage.setItem(name, JSON.stringify(value));
    }
    this.get = function (name)
    {
        name = _appId + name;

        if (_storage.getItem(name))
        {
            try // "undefined" as the value breaks it
            { return JSON.parse(_storage.getItem(name)); }
            catch (ex)
            { return null; }
        }
        else
            return null;
    }
    this.clear = function (name)
    {
        name = _appId + name;
        _storage.removeItem(name);
    }
    this.clearAll = function ()
    {
        for (key in _storage)
        {
            var appId = key.split("__")[0];
            if (appId + "__" == _appId)
                _storage.removeItem(key);
        }
    }
    this.getAll = function (verbose)
    {
        if (verbose != true)
            verbose = false;

        var ret = []
        for (key in _storage)
        {
            var details = key.split("__");
            if ((details[0] + "__" == _appId) || verbose)
                ret.push({ "key": details[1], "data": this.get(details[1]) });
        }
        return ret;
    }
}

// initilize - this will allow wait on loading dependencies.
utils.initilize = function ()
{
    // check our dependencies
    var loaded = true; // assume true, that way any fail can set it to false easily
    for (var dependent in utils.require)
    {
        var dependency = utils.require[dependent];
        switch (dependency.state)
        {
            case "pending": // not yet checked
                if (dependency.check())
                    dependency.state = "loaded";
                else // wasn't present, try to load it
                {
                    loaded = false;
                    // is it dependent on another dependencies - ie jQueryUI needs jQuery first
                    if (dependency.dependent == null || utils.require[dependency.dependent].state == "loaded")
                    {
                        dependency.state = "loading";
                        // load it then call initialize again
                        utils.loadExternal(dependency.url, dependency.type, function () { utils.initilize(); });
                    }
                }
                break;
            case "loading": // check to see if it has
                loaded = false;
                if (dependency.check())
                {
                    dependency.state = "loaded";
                    utils.initilize();
                }
                break;
        }
    }
    if (!loaded)
        return false;

    //basic alert dialogue
    utils.alert = function (message)
    {
        utils.userChoice("Alert", message);
    }
    // present a series of options to the user
    utils.userChoice = function (title, message, options)
    {
        var viewportWidth = $(window).width();
        var viewportHeight = $(window).height();

        var id = utils.createUUID();
        var html = "<div id='" + id + "' title='" + title + "'>" // overflow: hidden - control the scrolling in what ever you pass in
                 + "<div style='overflow: hidden; max-height: " + viewportHeight / 2 + "px; max-width: " + viewportWidth / 2 + "px;'>" + message + "</div>"
                 + "</div>";

        var defaults = { dialogClass: "no-close", modal: true, closeOnEscape: false, autoOpen: true, buttons: { "Close": function () { $(this).empty().remove(); }}};
        var settings = $.extend({},defaults, options);

        $(html).dialog(settings);
    };

    // some styling for inputs
    (function($)
    {
        $.fn.input = function (css)
        {
            if (!css)
                css = {};
            return this.each(function ()
            {
                $(this).addClass("ui-widget ui-widget-content ui-corner-all ui-button");
                $(this).css(css);
            });
        }
    })(jQuery);
    // and labels
    (function ($)
    {
        $.fn.label = function (css)
        {
            if (!css)
                css = {};
            return this.each(function ()
            {
                $(this).addClass("ui-widget ui-button");
                $(this).css(css);
            });
        }
    })(jQuery);

    // wrapper to make Ajax calls easy - being as most of the time the settigns will be the same
    utils.ajaxOptions = { global: true, baseURL: "/", type: "GET", contentType: "application/json", data: "", path: "", beforeSend: function (xhr) { }, success: function (data) { }, error: function (data) { } };
    utils.setAjaxOptions = function (options)
    {
        //  just merge what we pass in with whats already there
        utils.ajaxOptions = $.extend(utils.ajaxOptions, options);
    }
    utils.ajax = function (options)
    {
        var settings = $.extend({}, utils.ajaxOptions, options);

        $.ajax(
        {
            global: settings.global,
            url: settings.baseURL + settings.path,
            type: settings.type,
            contentType: settings.contentType,
            data: JSON.stringify(settings.data), // otherwise jQuery sends it as Form encoded
            beforeSend: settings.beforeSend,
            success: function (data) { utils.parseAjaxReply(data, settings.success); },
            error: function (data) { utils.parseAjaxReply(data, settings.error); }
        });
    }
    utils.parseAjaxReply = function (data, replyFunc)
    {
        // to remove the wrapping
        if (data["d"])
            data = data["d"];
        replyFunc(data);
    }
    // wait for a series (Array) of ajax function calls to return, then execute a function
    utils.await = function (calls, complete)
    {
        var set = {
            count: calls.length,
            replied: 0,
            check: function()
            {
                this.replied++;
                if(this.replied == this.count)
                    complete();
            }
        }

        for (var call = 0; call<calls.length; call++)
        {
            (function(that)
            {
                that.baseSuccess = that.success;
                that.baseError = that.error;
                that.success = function (data)
                {
                    if(that.baseSuccess)
                        that.baseSuccess(data);
                    set.check();
                };
                that.error = function(data)
                {
                    if(that.baseError)
                        that.baseError(data);
                    set.check();
                };
                // send off the call
                utils.ajax(that);
            })(calls[call]);
        }
    }

    if (utils.initilizeComplete)
        utils.initilizeComplete();
}
// load the dependencies, and create the functions which rely on them
utils.initilize();
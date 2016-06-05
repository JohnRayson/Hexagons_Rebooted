// hang everything off a global variable, if theres already an object called utils use that
// duplicate functions / variables might therefore behave in an unexpected manner depending on load order
var utils = utils || {};

utils.require = {
    jQuery: { type: "script", dependent: null, name: "jQuery", url: "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.0/jquery.min.js", check: function () { return window.jQuery; }, state: "pending" },
    jQueryUI: { type: "script", dependent: "jQuery", name: "jQueryUI", url: "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js", check: function () { return window.jQuery && window.jQuery.ui; }, state: "pending" },
    //jQueryUICSS: { type: "stylesheet", dependent: null, name: "jQueryUICSS", url: "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.css", check: function () { return window.jQuery && window.jQuery.ui; }, state: "pending" },
    moment: { type: "script", dependent: null, name: "moment", url: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js", check: function () { return window.moment; }, state: "pending" }
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
        var id = utils.createUUID();
        var html = "<div id='" + id + "' title='alert'>"
                 + "<h1>" + message + "</h1>"
                 + "</div>";
        $(html).dialog(
        {
            modal: true,
            close: function()
            {
                $(this).empty().remove();
            },
            buttons:
            {
                "OK": function ()
                {
                    $(this).dialogue("close");
                }
            }
        });
    }
    // present a series of options to the user
    utils.userChoice = function (message, buttons)
    {
        var html = "<div id='" + id + "' title='alert'>"
                 + "<h1>" + message + "</h1>"
                 + "</div>";
        
        $(html).dialog(
        {
            modal: true,
            buttons: buttons
        });
    }

    if (utils.initilizeComplete)
        utils.initilizeComplete();
}
// load the dependencies, and create the functions which rely on them
utils.initilize();



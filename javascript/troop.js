var troop = {};
// base model contains client only stuff
troop.baseModel =
{
    _tile: null,
    _range: 0,
    _movement: 0,
    reset: function ()
    {
        this._movement = this._baseMovement;
        this._range = this._baseRange;
    },
    getSprite: function ()
    {
        return this._sprite;
    },
    fight: function (defender) // we always start with the attacker
    {
        // convert all of these styles to a proper class / children
        var attacker = this;
        var innerDivStyle = "class='ui-widget-content ui-corner-all' style='position:absolute; top:0px; width:200px; height: 220px; margin:0px;";
        var spanStyle = "style='display: inline-block; width: 50%; padding: 2px 5px; margin: 0px; box-sizing: border-box;";
        var html = "<div style='position:relative; width: 100%; height: 222px; margin:0px; padding:0px; overflow: hidden;'>"
                 + "    <div " + innerDivStyle + " left: 0px;'><h1 class='utils-centre'>Attacker</h1>"
                 + "        <ul class='utils-plain-list'>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Attack</span><span " + spanStyle + "'>" + attacker._attack + "</span></li>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Terrain</span><span " + spanStyle + "'>" + attacker._tile._resource._attackModifier + "</span></li>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Loyalty</span><span " + spanStyle + "'>" + attacker._loyalty + "</span></li>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Strength</span><span " + spanStyle + "'>(Maths)</span></li>"
                 + "        </ul>"
                 + "    </div>"
                 + "    <div " + innerDivStyle + " right: 0px;'><h1 class='utils-centre'>Defender</h1>"
                 + "        <ul class='utils-plain-list'>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Defense</span><span " + spanStyle + "'>" + defender._defense + "</span></li>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Terrain</span><span " + spanStyle + "'>" + defender._tile._resource._defenseModifier + "</span></li>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Loyalty</span><span " + spanStyle + "'>" + defender._loyalty + "</span></li>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Strength</span><span " + spanStyle + "'>(Maths)</span></li>"
                 + "        </ul>"
                 + "    </div>"
                 + "</div>";

        utils.userChoice("Fight this battle?", html,
        {
            width: 450,
            height: 360,
            resizable: false,
            buttons:
            {
                "Fight": function ()
                {
                    var $dialogue = $(this);
                    utils.ajax(
                    {
                        path: "CombatResolution",
                        data: { fight: { attacker: attacker, defender: defender } },
                        success: function (data)
                        {
                            $dialogue.empty().remove();
                        }
                    });
                },
                "Retreat": function ()
                {
                    $(this).empty().remove();
                }
            }
        });
    }
}

// create a troop type
troop.createModel = function (data)
{
    var model = $.extend({}, troop.baseModel, data);
    model.reset();
    // allow it to be instancised
    troop[model._sprite] = function(tile)
    {
        return (function (model)
        {
            var that = $.extend(true, null, model);
            that._tile = tile;
            return that;
        })(model);
    }
}




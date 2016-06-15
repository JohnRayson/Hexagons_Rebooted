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
        // this needs to match the server (or does it... vaugness would be good) -- maybe you don't know the loyalty of the enemy
        function calculate(additions)
        {
            var strength = 0;
            for (var i = 0; i < additions.length; i++)
            {
                strength += additions[i];
            }
            return strength;
        }
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
                 + "            <li><span " + spanStyle + " text-align: right;'>Strength</span><span " + spanStyle + "'>" + calculate([attacker._attack, attacker._tile._resource._attackModifier, attacker._loyalty]) + "</span></li>"
                 + "        </ul>"
                 + "    </div>"
                 + "    <div " + innerDivStyle + " right: 0px;'><h1 class='utils-centre'>Defender</h1>"
                 + "        <ul class='utils-plain-list'>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Defense</span><span " + spanStyle + "'>" + defender._defense + "</span></li>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Terrain</span><span " + spanStyle + "'>" + defender._tile._resource._defenseModifier + "</span></li>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Loyalty</span><span " + spanStyle + "'>Unknown</span></li>"
                 + "            <li><span " + spanStyle + " text-align: right;'>Strength</span><span " + spanStyle + "'>&gt; " + calculate([defender._defense, defender._tile._resource._defenseModifier]) + "</span></li>"
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
                    // convert the attacker and defender to their base types for sending to the server.
                    var $dialogue = $(this);
                    utils.ajax(
                    {
                        path: "CombatResolution",
                        data: {
                            fight:
                                {
                                    attacker: baseTypes.convertToBase(attacker),
                                    attackHex: baseTypes.convertToBase(attacker._tile._resource),
                                    defender: baseTypes.convertToBase(defender),
                                    defenceHex: baseTypes.convertToBase(defender._tile._resource)
                                }
                        },
                        success: function (data)
                        {
                            // just replace the Troop on the defence hex with whatever the server replies with.
                            // and clear the Troop of the attacker hex - its either moved or its gone
                            // this is temporary as it means the troop will get refreshed and can have another go - win or lose
                            defender._tile._troop = new troop[data._sprite](defender._tile);
                            attacker._tile._troop = null;

                            var cartograph = defender._tile._map._settings;
                            cartograph._mode = cartography.mapMode;
                            cartograph.drawBoard(); 
                            
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




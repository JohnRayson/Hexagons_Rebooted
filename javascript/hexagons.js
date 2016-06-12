

var hexagons = {
    info: null,
    spriteSheet: null
}

utils.ready(function ()
{
    // set up the Ajax options
    utils.setAjaxOptions({
        baseURL: "Server.aspx/",
        type: "POST",
        error: function (data)
        {
            utils.alert("<pre>" + JSON.stringify(data, null, 4) + "</pre>");
        }
    });

    $(document).ready(function ()
    {
        var loadElements = ["logic", "spritesheet"];
        var isLoaded = function (element)
        {
            var removeIndex = loadElements.indexOf(element);
            if (removeIndex > -1)
                loadElements.splice(removeIndex, 1);

            if (loadElements.length == 0)
            {
                // load the troops
                var troopModels = ["Archer", "Spearman"];
                for (var model = 0; model < troopModels.length; model++)
                {
                    troopModels[model] = {
                        path: "GetModel",
                        data: { type: troopModels[model] },
                        success: function (data)
                        {
                            troop.createModel(data)
                        }
                    }
                }
                // load the resorces
                var resourceModels = ["Grass", "Swamp", "Water", "Forest", "Mountain"];
                for (var model = 0; model < resourceModels.length; model++)
                {
                    resourceModels[model] = {
                        path: "GetModel",
                        data: { type: resourceModels[model] },
                        success: function (data)
                        {
                            resource.createModel(data)
                        }
                    }
                }
                // put the lists togtether
                var models = [].concat(troopModels, resourceModels);
                // wait till they have all been built
                utils.await(models, function ()
                {
                    for (var x = 0; x < hexagons.info._width; x++)
                    {
                        for (var y = 0; y < hexagons.info._height; y++)
                        {
                            var tile = new map.tile(x, y, hexagons.info);
                            var base = Math.random();

                            if (base < 0.1)
                                tile._resource = new resource.forest();
                            else if (base < 0.5)
                                tile._resource = new resource.grass();
                            else if (base < 0.6)
                                tile._resource = new resource.mountain();
                            else if (base < 0.7)
                                tile._resource = new resource.swamp();
                            else
                                tile._resource = new resource.water();

                            hexagons.info._tiles.push(tile);
                        }
                    }

                    // put some settlements on
                    for (var i = 0; i < hexagons.info._tiles.length; i++)
                    {
                        var tile = hexagons.info._tiles[i];
                        if (tile._resource.getType() == "grass")
                        {
                            var hexInfo = { hexX: tile._x, hexY: tile._y }
                            var neighbours = cartography.getNeighbouringHexs(hexInfo, 2);
                        }
                    }
                    // put some troops on the map
                    for (var i = 0; i < hexagons.info._tiles.length; i++)
                    {
                        var tile = hexagons.info._tiles[i];
                        if (tile._resource.getType() != "water")
                        {
                            var baseRand = Math.random()
                            if (baseRand < 0.1)
                            {
                                var add = true;
                                var near = tile.getNeighbours();
                                for (var j = 0; j < near.length; j++)
                                {
                                    if (near[j]._troop != null)
                                        add = false;
                                }
                                if (add && baseRand < 0.05)
                                    tile._troop = new troop.spearman(tile);
                                else if(add)
                                    tile._troop = new troop.archer(tile);
                            }
                        }
                    }
                    version.drawBoard();
                });

            }
        }

        $("#endTurnBtn").button().click(function ()
        {
            var $label = $("#header_turnCounter")
            $label.data("turn", $label.data("turn") + 1);
            $label.html("Turn " + $label.data("turn"));

            for (var i = 0; i < hexagons.info._tiles.length; i++)
            {
                if (hexagons.info._tiles[i]._troop)
                {
                    hexagons.info._tiles[i]._troop.reset();
                }
            }
        });

        // troops from http://opengameart.org/content/lpc-medieval-fantasy-character-sprites
        hexagons.spriteSheet = {
            img: new Image(),
            size: 62.35,
            forest: { x: 0, y: 0 },
            hamlet: { x: 0, y: 1 },
            village: { x: 1, y: 1 },
            grass: { x: 9, y: 0 },
            water: { x: 9, y: 1 },
            mountain: { x: 9, y: 2 },
            swamp: { x: 9, y: 3 },
            road_1: { x: 7, y: 0 },
            road_2: { x: 7, y: 1 },
            spearman: { x: 8, y: 0 },
            archer: { x: 8, y: 1 },
        }

        hexagons.spriteSheet.img.onload = function ()
        {
            isLoaded("spritesheet");
        };
        hexagons.spriteSheet.img.src = "images/62_Sprite.png";
        var version = new cartography.settings('hexmap', hexagons.spriteSheet);

        hexagons.info = new map.settings(50, 25, version);

        version._map = hexagons.info;

        var docWidth = $(document).width();
        var docHeight = $(document).height();
        $("canvas").attr("width", docWidth).attr("height", docHeight);

        //version.drawBoard();
        isLoaded("logic");

    });

    $(window).resize(function ()
    {
        // clean the click event
        hexagons.info._settings._mode = cartography.mapMode;

        var docWidth = $(document).width();
        var docHeight = $(document).height();
        $("canvas").attr("width", docWidth).attr("height", docHeight);

        hexagons.info._settings.drawBoard();
       
    });

    var scrollInterval = null;
    // map move
    $(".mapscroller").hover(function ()
    {
        // mouse in
        var direction = $(this).attr("id").split("-")[1]; // id = scroll-up / scroll-down / scroll-left / scroll-right
        hexagons.info._settings.scroll(direction);

    }, function ()
    {
        // mouse out
        hexagons.info._settings.scroll("stop");
    });
});






var hexagons = {
    info: null,
    spriteSheet: null
}

utils.ready(function ()
{
    $(document).ready(function ()
    {
        var loadElements = ["logic", "spritesheet"];
        var isLoaded = function (element)
        {
            var removeIndex = loadElements.indexOf(element);
            if (removeIndex > -1)
                loadElements.splice(removeIndex, 1);

            if (loadElements.length == 0)
                version.drawBoard();
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
            dwarf: { x: 8, y: 0 }
        }

        hexagons.spriteSheet.img.onload = function ()
        {
            isLoaded("spritesheet");
        };
        hexagons.spriteSheet.img.src = "images/62_Sprite.png";
        var version = new cartography.settings('hexmap', hexagons.spriteSheet);

        hexagons.info = new map.settings(50, 25, version);

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
                // if there are no settlements in the neighbours, add one here
                //var foundSettlement = false;
                //for (var j = 0; j < neighbours.length; j++)
                //{
                //    if (neighbours[j]._tile._settlement != null)
                //    {
                //        foundSettlement = true;
                //        break;
                //    }
                //}
                //if (!foundSettlement)
                //    tile._settlement = new population.settlement();
            }
        }

        // put some troops on
        for (var i = 0; i < hexagons.info._tiles.length; i++)
        {
            var tile = hexagons.info._tiles[i];
            if (tile._resource.getType() == "grass")
            {
                if (Math.random() < 0.2)
                {
                    var add = true;
                    var near = tile.getNeighbours();
                    for (var j = 0; j < near.length; j++)
                    {
                        if (near[j]._troop != null)
                            add = false;
                    }
                    if (add)
                        tile._troop = new troop.dwarf();
                }
            }
        }

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




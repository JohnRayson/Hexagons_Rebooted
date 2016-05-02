
$(document).ready(function ()
{
    // testing
    var grid = new paths.grid(10, 10);
    grid.fillGrid();

    $("#endTurnBtn").button().click(function ()
    {

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
        road_2: { x: 7, y: 1 }
    }
    hexagons.spriteSheet.img.src = "images/62_Sprite.png";
    var version = new cartography.settings('hexmap', hexagons.spriteSheet);

    hexagons.info = new map.settings(20, 10, version);

    // { base: grass, vegetation: forest, settlement: hut, minerals: {}, agriculture: {} } 
    // x = 0 is a test row

    var tile = new map.tile(0, 0, hexagons.info); tile._resource = new resource.grass(); hexagons.info._tiles.push(tile);
    var tile = new map.tile(0, 1, hexagons.info); tile._resource = new resource.forest(); hexagons.info._tiles.push(tile);
    var tile = new map.tile(0, 2, hexagons.info); tile._resource = new resource.water(); hexagons.info._tiles.push(tile);
    var tile = new map.tile(0, 3, hexagons.info); tile._resource = new resource.mountain(); hexagons.info._tiles.push(tile);
    var tile = new map.tile(0, 4, hexagons.info); tile._resource = new resource.swamp(); hexagons.info._tiles.push(tile);

    var tile = new map.tile(0, 6, hexagons.info); tile._resource = new resource.grass(); tile._settlement = new population.settlement({ size: 1 }); hexagons.info._tiles.push(tile);
    var tile = new map.tile(0, 7, hexagons.info); tile._resource = new resource.grass(); tile._settlement = new population.settlement({ size: 6 }); hexagons.info._tiles.push(tile);

    for (var x = 1; x < hexagons.info._width; x++)
    {
        for (var y = 0; y < hexagons.info._height; y++)
        {
            var tile = new map.tile(x, y, hexagons.info);
            var base = Math.random();

            if (base < 0.1)
                tile._resource = new resource.forest();
            else if(base < 0.5)
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
    
    version._map = hexagons.info;

    var docWidth = $(document).width();
    var docHeight = $(document).height();
    $("canvas").attr("width", docWidth).attr("height", docHeight);

    version.drawBoard();
    
});
$(window).resize(function ()
{
    cartography.go('hexmap', hexagons.info, hexagons.spriteSheet);
});

var hexagons = {
    info: null,
    spriteSheet: null
}


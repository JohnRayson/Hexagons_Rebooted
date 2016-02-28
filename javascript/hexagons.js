
$(document).ready(function ()
{
    $("#endTurnBtn").button().click(function ()
    {

    });

    hexagons.info = new map.settings(25, 17);

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

    // { base: grass, vegetation: forest, settlement: hut, minerals: {}, agriculture: {} } 
    // x = 0 is a test row

    var tile = new map.tile(0, 0); tile._resource = new resource.grass(); hexagons.info._tiles.push(tile);
    var tile = new map.tile(0, 1); tile._resource = new resource.forest(); hexagons.info._tiles.push(tile);
    var tile = new map.tile(0, 2); tile._resource = new resource.water(); hexagons.info._tiles.push(tile);
    var tile = new map.tile(0, 3); tile._resource = new resource.mountain(); hexagons.info._tiles.push(tile);
    var tile = new map.tile(0, 4); tile._resource = new resource.swamp(); hexagons.info._tiles.push(tile);

    var tile = new map.tile(0, 6); tile._resource = new resource.grass(); tile._settlement = new population.settlement({ size: 1 }); hexagons.info._tiles.push(tile);
    var tile = new map.tile(0, 7); tile._resource = new resource.grass(); tile._settlement = new population.settlement({ size: 6 }); hexagons.info._tiles.push(tile);

    for (var x = 1; x < hexagons.info._width; x++)
    {
        for (var y = 0; y < hexagons.info._height; y++)
        {
            var tile = new map.tile(x, y);
            var base = Math.random();

            if (base < 0.1)
                tile._resource = new resource.forest();
            else if(base < 0.5)
            {
                tile._resource = new resource.grass();
                var rand = Math.random();
                if (rand > 0.8 && rand <= 0.9)
                    tile._settlement = new population.settlement({ size: 1 });
                else if (rand > 0.9)
                    tile._settlement = new population.settlement({ size: 6 });
            }
            else if (base < 0.6)
                tile._resource = new resource.mountain();
            else if (base < 0.7)
                tile._resource = new resource.swamp();
            else
                tile._resource = new resource.water();

            hexagons.info._tiles.push(tile);
        }
    }

    var docWidth = $(document).width();
    var docHeight = $(document).height();
    $("canvas").attr("width", docWidth).attr("height", docHeight);

    
    cartography.go('hexmap', hexagons.info, hexagons.spriteSheet);
});
$(window).resize(function ()
{
    cartography.go('hexmap', hexagons.info, hexagons.spriteSheet);
});

var hexagons = {
    info: null,
    spriteSheet: null
}


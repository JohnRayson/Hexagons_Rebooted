$(document).ready(function ()
{
    var spriteSheet = {
        img: new Image(),
        size: 62.35,
        forest: { x: 0, y: 0 },
        hut: { x: 0, y: 1 }
    };
    spriteSheet.img.src = "images/62_Sprite.png";


    var info = new map.settings(25, 17);

    // { base: grass, vegetation: forest, settlement: hut, minerals: {}, agriculture: {} } 
    for (var x = 0; x < info._width; x++)
    {
        for (var y = 0; y < info._height; y++)
        {
            var tile = new map.tile(x, y);

            var base = Math.random();
            if (base < 0.5)
                tile._base = "green";
            else if (base < 0.7)
                tile._base = "#666";
            else
                tile._base = "blue";

            if (tile._base == "green")
            {
                var rand = Math.random();
                if (rand <= 0.2)
                    tile._vegetation = "forest";
                else if (rand >= 0.8)
                    tile._settlement = "hut";
            }

            info._tiles.push(tile);
        }
    }

    var docWidth = $(document).width();
    var docHeight = $(document).height();
    $("canvas").attr("width", docWidth).attr("height", docHeight);

    
    cartography.go('hexmap', info, spriteSheet);
});


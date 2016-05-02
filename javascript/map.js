var map = {};

map.selectedTile = null;

map.settings = function (width, height, parent)
{
    // hold a reference to its parent
    this._settings = parent;

    this._width = width;
    this._height = height;
    this._tiles = []; // of map.tile

    //functions
    this.getTileAt = map.getTileAt;
}

map.tile = function(x, y, parent)
{
    // keep a reference to its parent map
    this._map = parent;

    // where is it - so the tile knows its own position, also unquie id
    this._x = x;
    this._y = y;
    this._uniqueRef = x + "_" + y;
    
    // stuff about this tile
    this._resource = null;
    this._settlement = null;
    this._minerals = {};
    this._agriculture = {};

    // gets the pixel location of this hex
    this.getLocation = function ()
    {
        var reply = 
        {
            topLeft: {},
            middle: {}
        }

        reply.topLeft = {
            x: this._x * this._map._settings._hexRectangleWidth + ((this._y % 2) * this._map._settings._hexRadius),
            y: this._y * (this._map._settings._sideLength + this._map._settings._hexHeight)

        };

        reply.middle = {
            x: reply.topLeft.x + (this._map._settings._hexRectangleWidth / 2),
            y: reply.topLeft.y + ((this._map._settings._sideLength + this._map._settings._hexHeight)/2)
        };
        return reply;
    }
    this.click = function ()
    {
        this._map._settings.floodFill(this, 3);
        /*
        var neighbours = this.getNeighbours();
        for (var i = 0; i < neighbours.length; i++)
        {
            neighbours[i].highlight();
        }
        */
        /*
        var id = Math.random().toString().substring(3);

        var html = "<div title='You clicked' id='" + id + "' >"
                 + "id: " + id + "<br />"
                 + "resource: " + (this._resource || "") + "<br />"
                 + "settlement: " + (this._settlement || "") + "<br />"
                 + "</div>";

        $(html).dialog(
        {
            modal: true,
            close: function () { $(this).empty().remove(); },
            buttons: { "Close": function () { $(this).dialog("close"); } }
        });
        */
    }
    this.draw = function ()
    {
        var cartography = this._map._settings;
        var hexTopLeft = this.getLocation().topLeft;

        cartography.drawHexagon(hexTopLeft.x, hexTopLeft.y, this._resource._colour, 1);

        if(this._resource)
            cartography.drawSprite(hexTopLeft.x, hexTopLeft.y, this._resource.getSprite());
        if (this._settlement)
            cartography.drawSprite(hexTopLeft.x, hexTopLeft.y, this._settlement.getSprite());
    }
    this.writeText = function (text)
    {
        var location = this.getLocation().middle;
        var fontSize = 15;

        this._map._settings._ctx.font = fontSize + "px Arial";
        this._map._settings._ctx.fillText(text, location.x - (fontSize / 2.2), location.y + fontSize);
    }
    // ?? Not sure why this is useful
    this.toCube = function ()
    {
        var x = this._x;
        var y = this._y;
        var z = -x - y
        return { x: x, y: y, z: z };
    };
    // gets all the hexagons that border this one
    this.getNeighbours = function ()
    {
        var neighbours = [];
        // to the left and right are always there
        neighbours.push(this._map.getTileAt((x - 1), y));
        neighbours.push(this._map.getTileAt((x + 1), y));
        // similarly  y+ and y- are always present
        neighbours.push(this._map.getTileAt(x, (y - 1)));
        neighbours.push(this._map.getTileAt(x, (y + 1)));
        // depending on where this is an odd ore even row tells you if you been to go infront x+1 or behind x-1
        neighbours.push(this._map.getTileAt((x - ((y % 2) == 0 ? 1 : -1)), (y - 1)));
        neighbours.push(this._map.getTileAt((x - ((y % 2) == 0 ? 1 : -1)), (y + 1)));

        var reply = [];
        for (var i = 0; i < neighbours.length; i++)
        {
            // its null if it doesn't exist
            if (neighbours[i])
                reply.push(neighbours[i])
        }
        return reply;
    }
    // highlights this hexagon
    this.highlight = function ()
    {
        var loc = this.getLocation().topLeft;
        this._map._settings.drawHexagon(loc.x, loc.y, "#fff", 0.5);
    };

    return this;
}

map.getTileAt = function (x, y)
{
    for (var i = 0; i < this._tiles.length; i++)
    {
        if (this._tiles[i]._x == x && this._tiles[i]._y == y)
            return this._tiles[i];
    }
    return null; // it doesn't exist
}



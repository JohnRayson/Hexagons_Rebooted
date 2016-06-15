var map = {};

map.selectedTile = null;

map.settings = function (width, height, parent)
{
    // hold a reference to its parent
    this._settings = parent;
    this._settings._map = this;
    
    this._width = width;
    this._height = height;
    this._tiles = []; // of map.tile

    // to remember its state on redraw
    this._drawState = null;

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
    this._troop = null;
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

        // adjust them for the potential that we have moved the map
        reply.topLeft.x += this._map._settings._position.left;
        reply.topLeft.y += this._map._settings._position.top;

        reply.middle = {
            x: reply.topLeft.x + (this._map._settings._hexRectangleWidth / 2),
            y: reply.topLeft.y + ((this._map._settings._sideLength + this._map._settings._hexHeight)/2)
        };

        

        return reply;
    }
    this.click = function ()
    {
        // check the mode
        // this logic should be moved to troop.js
        var mode = this._map._settings._mode
        switch (mode.type)
        {
            default:
                if (this._troop)
                {
                    var matched = this._map._settings.floodFill({ source: this, range: this._troop._range, movement: this._troop._movement });
                    if (matched.length > 0)
                    {
                        this._map._settings._mode = { type: "move", available: matched, source: this };
                        return true;
                    }
                }
                break;
            case "move":
                // is it the same as the source
                if (this._uniqueRef == mode.source._uniqueRef)
                {
                    this._map._settings._mode = { type: null };
                    this._map._settings.drawBoard(); 
                    return true;
                }
                // is the click inside the available ones
                for (var i = 0; i < mode.available.length; i++)
                {
                    if (this._uniqueRef == mode.available[i]._uniqueRef)
                    {
                        // get the event info
                        var eventInfo = null;
                        for (member in this)
                        {
                            if (member.substring(0, 5) == "_tmp_")
                                eventInfo = this[member];
                        }

                        // is there already a troop here?
                        if (this._troop)
                        {
                            mode.source._troop.fight(this._troop);
                        }
                        else // move the troop to the new hex
                        {
                            // this clones the object true = deep copy.
                            this._troop = $.extend(true, {}, mode.source._troop);
                            this._troop._movement -= eventInfo.cost;
                            this._troop._range -= eventInfo.range;
                            mode.source._troop = null;

                            this._map._settings._mode = { type: null };
                            this._map._settings.drawBoard();

                            return true;
                        }
                    }
                }
                break;
        }
        // nothing else, just highlight the clicked - this is for debugging
        //this.highlight();
    }
    this.draw = function (preserve)
    {
        var cartography = this._map._settings;
        var hexTopLeft = this.getLocation().topLeft;

        if (!preserve)
            this._drawState = null;

        // is it actually viewable
        //if (hexTopLeft.x > -50 && hexTopLeft.y > -50 && hexTopLeft.x < 1000 && hexTopLeft.y < 1000)
        {

            cartography.drawHexagon(hexTopLeft.x, hexTopLeft.y, this._resource._colour, 1);

            if (this._resource)
                cartography.drawSprite(hexTopLeft.x, hexTopLeft.y, this._resource.getSprite());
            if (this._settlement)
                cartography.drawSprite(hexTopLeft.x, hexTopLeft.y, this._settlement.getSprite());
            if (this._troop)
                cartography.drawSprite(hexTopLeft.x, hexTopLeft.y, this._troop.getSprite());

            // has it been drawn on before
            if (this._drawState)
            {
                if (this._drawState.highlight)
                    this.highlight(this._drawState.highlight);
                if (this._drawState.text)
                    this.writeText(this._drawState.text);
            }
        }
    }
    // writes text on the hex
    this.writeText = function (text)
    {
        var location = this.getLocation().middle;
        var fontSize = 15;

        this._map._settings._ctx.font = fontSize + "px Arial";
        this._map._settings._ctx.fillStyle = "#fff";
        this._map._settings._ctx.fillText(text, location.x - ((fontSize / 3) * text.length), location.y + fontSize);

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
    this.getNeighbours = function (options)
    {
        var settings = $.extend({ sortFunc: null, inSet: null }, options);

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
        // do we want a custom sort
        if (settings.sortFunc != null)
        {
            reply.sort(settings.sortFunc);
        }
        // do we only want to include those in another set - an intersect
        if (settings.inSet != null)
        {
            var restrictedReply = [];
            for (var i = 0; i < settings.inSet.length; i++)
            {
                for (var j = 0; j < reply.length; j++)
                {
                    if (settings.inSet[i]._uniqueRef == reply[j]._uniqueRef)
                        restrictedReply.push(reply[j]);
                }
            }
            reply = restrictedReply;
        }
        return reply;
    }
    // highlights this hexagon
    this.highlight = function (options)
    {
        var settings = $.extend({ colour: "#fff" }, options);
        var loc = this.getLocation().topLeft;
        this._map._settings.drawHexagon(loc.x, loc.y, settings.colour, 0.5);
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



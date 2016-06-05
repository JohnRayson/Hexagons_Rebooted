var cartography = {};

cartography.mapMode = {
    type: null
};

cartography.settings = function (canvasId, spriteSheet)
{
    this._canvas = document.getElementById(canvasId);
    this._ctx = this._canvas.getContext('2d');

    this._ctx.fillStyle = "#000000";
    this._ctx.strokeStyle = "#CCCCCC";
    this._ctx.lineWidth = 1;

    this._map = null;
    this._spriteSheet = spriteSheet;
    this._hexHeight = null;
    this._hexRadius = null;
    this._hexRectangleHeight = null;
    this._hexRectangleWidth = null;
    this._hexagonAngle = 0.523598776; // 30 degrees in radians
    this._sideLength = 36;
    this._extent = { bottom: 0, right: 0 };
    this._position = { top: 0, left: 0 };

    this._hexHeight = Math.sin(this._hexagonAngle) * this._sideLength;
    this._hexRadius = Math.cos(this._hexagonAngle) * this._sideLength;
    this._hexRectangleHeight = this._sideLength + 2 * this._hexHeight;
    this._hexRectangleWidth = 2 * this._hexRadius;

    this._mouseLastHex = { X: null, y: null };

    this._mode = cartography.mapMode;

    // functions
    this.setExtent = function ()
    {
        this._extent.bottom = (((this._hexRectangleHeight - this._hexHeight) * this._map._height) - this._canvas.height) + this._hexHeight;
        this._extent.right = ((this._hexRectangleWidth * this._map._width) - this._canvas.width) + (this._hexRectangleWidth / 2);
    };
    this.clear = function ()
    {
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    };
    this._scrollInterval = null;
    this.scroll = function (direction)
    {
        var that = this;
        function start(direction)
        {
            var speed = 10;
            that._scrollInterval = window.setInterval(function ()
            {
                speed++;
                switch (direction)
                {
                    case "up":
                        that._position.top += speed;
                        that._position.top = (that._position.top > 0 ? 0 : that._position.top);
                        break;
                    case "down":
                        that._position.top -= speed;
                        that._position.top = (that._position.top > (0-that._extent.bottom) ? that._position.top : (0-that._extent.bottom));
                        break;
                    case "left":
                        that._position.left += speed;
                        that._position.left = (that._position.left > 0 ? 0 : that._position.left);
                        break;
                    case "right":
                        that._position.left -= speed;
                        that._position.left = (that._position.left > (0 - that._extent.right) ? that._position.left : (0 - that._extent.right));
                        break;
                }
                hexagons.info._settings.drawBoard();
            }, 50);
        }
        function stop()
        {
            if(that._scrollInterval)
                window.clearInterval(that._scrollInterval);
        }
        if (direction == "stop")
            stop();
        else
            start(direction);
    }


    this.floodFill = cartography.floodFill;
    this.getMouseHex = cartography.getMouseHex;
    this.getHexPos = cartography.getHexPos;
    this.getHexXY = cartography.getHexXY;
    this.getNeighbouringHexs = cartography.getNeighbouringHexs;
    this.drawBoard = cartography.drawBoard;
    this.drawHexagon = cartography.drawHexagon;
    this.drawSprite = cartography.drawSprite;

    this.mouseClick = function (eventInfo)
    {
        var mouseCurrentHex = this.getMouseHex(eventInfo);

        var tile = this._map.getTileAt(mouseCurrentHex.hexX, mouseCurrentHex.hexY);
        if (tile)
            tile.click();
    }

    this.mouseMove = cartography.mouseMove;
    this.mouseOut = cartography.mouseOut;

    // events
    var that = this;
    this._canvas.addEventListener("click", function (eventInfo)
    {
        that.mouseClick(eventInfo);
    });
    this._canvas.addEventListener("mousemove", function (eventInfo)
    {
        //that.mouseMove(eventInfo);
    });
    this._canvas.addEventListener("mouseout", function (eventInfo)
    {
        //that.mouseOut(eventInfo);
    });
}

cartography.go = function (elementId, map, spriteSheet)
{
    var version = new cartography.settings(elementId, map, spriteSheet);
    
    version.drawBoard();
}

cartography.mouseMove = function (eventInfo)
{
    var mouseCurrentHex = this.getMouseHex(eventInfo);

    // Check if the mouse's coords are on the board
    if (mouseCurrentHex.hexX >= 0 && mouseCurrentHex.hexX < this._map._width)
    {
        if (mouseCurrentHex.hexY >= 0 && mouseCurrentHex.hexY < this._map._height)
        {
            // but are they still in the same hex?
            if ((mouseCurrentHex.x != this._mouseLastHex.x) || (mouseCurrentHex.y != this._mouseLastHex.y))
            {
                this._mouseLastHex = mouseCurrentHex;

                this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
                this.drawBoard();

                //this.drawHexagon(this._mouseLastHex.x, this._mouseLastHex.y, "#fff", 0.5);


                var neighbours = this.getNeighbouringHexs(this._mouseLastHex, 3);
                for (var neighbour in neighbours)
                {
                    if(neighbours[neighbour])
                        this.drawHexagon(neighbours[neighbour].x, neighbours[neighbour].y, "#fff", 0.5);
                }
            }
        }
    }
}

cartography.floodFill = function (options)
{
    // clear the board before highlighting
    this.drawBoard();

    var settings = $.extend({ source: null, range: 0, movement: 0 }, options);

    // create a unique id for this event
    var eventId = "_tmp_" + utils.createUUID();
    // as this hex might be assessible from a number of others, we keep a track of how it was reached.
    settings.source[eventId] = { visited: true, range: 0, cost: 0, siblings: [] };

    var matched = [];
    var frontier = [];
    frontier.push(settings.source);

    function getFrontier(frontier, range)
    {
        var newFrontier = [];

        for (var i = 0; i < frontier.length; i++)
        {
            // clean up the old eventIds 
            for (var member in frontier[i])
            {
                if (member.substring(0, 5) == "_tmp_" && member != eventId)
                    delete (frontier[i][member]);
            }
            // get all the neighbours of this hex, sorting the reply by movementCost
            var near = frontier[i].getNeighbours(
            {
                sortFunc: function (a, b)
                {
                    if (a._resource._movementCost < b._resource._movementCost)
                        return -1;
                    else if (a._resource._movementCost > b._resource._movementCost)
                        return 1;
                    else
                        return 0;
                }
            });
            // loop round them all and find the shortest route to each hex coming from the ring below
            for (var j = 0; j < near.length; j++)
            {
                if (!near[j][eventId])
                {
                    // log the cost of gettign the here. 
                    // this still might not be the lowest as potentially coming from one of its own siblings will be cheaper, this gets done after all are calculated
                    near[j][eventId] = {
                        visited: true,
                        range: range,
                        cost: (frontier[i][eventId].cost + near[j]._resource._movementCost),
                        siblings: near[j].getNeighbours({ inSet: near })
                    };

                    newFrontier.push(near[j]);
                    matched.push(near[j]);
                }
            }

            // loop round the siblings of each one and check that the range from there isn't shorter, update it if it is
            for (var j = 0; j < near.length; j++)
            {
                for (var k = 0; k < near[j][eventId].siblings.length; k++)
                {
                    if (near[j][eventId].cost > (near[j][eventId].siblings[k][eventId].cost + near[j]._resource._movementCost))
                        near[j][eventId].cost = (near[j][eventId].siblings[k][eventId].cost + near[j]._resource._movementCost)
                }
            }
        }
        return newFrontier;
    }
    // so range can be 0 based, ie a range of 0 gives just the original hex, 1 gives those next to it
    for (var i = 0; i < settings.range; i++)
    {
        frontier = getFrontier(frontier, (i + 1));
    }
    var reply = [];
    for (var i = 0; i < matched.length; i++)
    {
        if (matched[i][eventId].cost <= settings.movement)
        {
            reply.push(matched[i]);

            if (matched[i]._troop)
                matched[i].highlight({ colour: "#f00" });
            else
                matched[i].highlight();

            matched[i].writeText(matched[i][eventId].range.toString() + "/" + matched[i][eventId].cost.toString());
        }   
    }
    return reply;
}

cartography.mouseOut = function (eventInfo)
{
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this.drawBoard();
}
// takes a mouse position and works out the top left of the hex + its x/y position
cartography.getMouseHex = function(eventInfo)
{
    var x, y, hexX, hexY;

    x = eventInfo.offsetX || eventInfo.layerX;
    y = eventInfo.offsetY || eventInfo.layerY;

    // adjust them for the potential that we have moved the map
    x += (0-this._position.left);
    y += (0-this._position.top);

    hexY = Math.floor(y / (this._hexHeight + this._sideLength));
    hexX = Math.floor((x - (hexY % 2) * this._hexRadius) / this._hexRectangleWidth);

    var hexInfo = {
        hexX: hexX,
        hexY: hexY,
        x: hexX * this._hexRectangleWidth + ((hexY % 2) * this._hexRadius),
        y: hexY * (this._hexHeight + this._sideLength)
    };

    return hexInfo;
}
cartography.getHexXY = function (offsetX, offsetY)
{
    var x, y, hexX, hexY;

    x = offsetX;
    y = offsetY;

    hexY = Math.floor(y / (this._hexHeight + this._sideLength));
    hexX = Math.floor((x - (hexY % 2) * this._hexRadius) / this._hexRectangleWidth);

    var hexInfo = {
        hexX: hexX,
        hexY: hexY,
        x: hexX * this._hexRectangleWidth + ((hexY % 2) * this._hexRadius),
        y: hexY * (this._hexHeight + this._sideLength)
    };

    return hexInfo;
}
// takes the x/y position of a hex and works out the top left corner
cartography.getHexPos = function (hexX, hexY)
{
    var hexInfo = {
        hexX: hexX,
        hexY: hexY,
        x: hexX * this._hexRectangleWidth + ((hexY % 2) * this._hexRadius),
        y: hexY * (this._hexHeight + this._sideLength),
        range: 0 
    };

    return hexInfo;
}

cartography.getNeighbouringHexs = function (hexInfo, range)
{
    var hexes = [];
    hexes.push(hexInfo);

    // this finally works
    var that = this;
    function getHexes(inHexes)
    {
        while (range > 0)
        {
            var hexes = [];
            for(var i = 0; i < inHexes.length; i++)
            {
                var x = inHexes[i].hexX;
                var y = inHexes[i].hexY;

                hexes.push(that.getHexPos((x - 1), y));
                hexes.push(that.getHexPos((x + 1), y));
                hexes.push(that.getHexPos(x, (y - 1)));
                hexes.push(that.getHexPos(x, (y + 1)));
                hexes.push(that.getHexPos((x - ((y % 2) == 0 ? 1 : -1)), (y - 1)));
                hexes.push(that.getHexPos((x - ((y % 2) == 0 ? 1 : -1)), (y + 1)));
            }
            // add these onto the array to pass down
            inHexes = inHexes.concat(hexes);
            range--;
            return hexes.concat(getHexes(inHexes));
        }
    }

    var withDuplicates = getHexes(hexes);
    var neighbours = [];

    // clear the duplicates - keeping the closest
    var duplicate = false;
    for (var i = 0; i < withDuplicates.length; i++)
    {
        if (!withDuplicates[i])
            continue;

        duplicate = false;
        for (var j = 0; j < neighbours.length; j++)
        {
            duplicate = (withDuplicates[i].hexX == neighbours[j].hexX && withDuplicates[i].hexY == neighbours[j].hexY || duplicate);
        }
        if (!duplicate)
        {
            //withDuplicates[i]._tile = this._map.getTileAt(withDuplicates[i].hexX, withDuplicates[i].hexY);
            neighbours.push(withDuplicates[i])
        }
    }

    return neighbours;
}

cartography.drawBoard = function()
{
    // clear whats there and redraw
    this.clear();

    for (var x = 0; x < this._map._width; ++x)
    {
        for (var y = 0; y < this._map._height; ++y)
        {
            try
            {
                var tile = this._map.getTileAt(x, y);
                tile.draw(this);
            }
            catch (ex)
            { } // map might not be exacally square
        }
    }
    this.setExtent();
}

cartography.drawHexagon = function(x, y, fillColour, fillOpacity)
{
    this._ctx.fillStyle = fillColour;

    this._ctx.beginPath();
    this._ctx.moveTo(x + this._hexRadius, y);
    this._ctx.lineTo(x + this._hexRectangleWidth, y + this._hexHeight);
    this._ctx.lineTo(x + this._hexRectangleWidth, y + this._hexHeight + this._sideLength);
    this._ctx.lineTo(x + this._hexRadius, y + this._hexRectangleHeight);
    this._ctx.lineTo(x, y + this._sideLength + this._hexHeight);
    this._ctx.lineTo(x, y + this._hexHeight);
    this._ctx.closePath();

    if (fillColour)
    {
        this._ctx.save();
        this._ctx.globalAlpha = fillOpacity;
        this._ctx.fillStyle = fillColour;
        this._ctx.fill();
        this._ctx.restore();
    }
    this._ctx.stroke();
}

cartography.drawSprite = function(x, y, element)
{
    var sheet = this._spriteSheet;
    if (element)
        this._ctx.drawImage(sheet.img, (sheet[element].x * sheet.size), (sheet[element].y * sheet.size), sheet.size, sheet.size, x, y + ((this._hexRectangleHeight - sheet.size) / 2), sheet.size, sheet.size);
}

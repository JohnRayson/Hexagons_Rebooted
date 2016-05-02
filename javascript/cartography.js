var cartography = {};

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

    this._hexHeight = Math.sin(this._hexagonAngle) * this._sideLength;
    this._hexRadius = Math.cos(this._hexagonAngle) * this._sideLength;
    this._hexRectangleHeight = this._sideLength + 2 * this._hexHeight;
    this._hexRectangleWidth = 2 * this._hexRadius;

    this._mouseLastHex = { X: null, y: null };

    // functions
    this.floodFill = cartography.floodFill;
    this.getMouseHex = cartography.getMouseHex;
    this.getHexPos = cartography.getHexPos;
    this.getHexXY = cartography.getHexXY;
    this.getNeighbouringHexs = cartography.getNeighbouringHexs;
    this.drawBoard = cartography.drawBoard;
    this.drawHexagon = cartography.drawHexagon;
    this.drawSprite = cartography.drawSprite;

    this.mouseClick = cartography.mouseClick;
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

cartography.mouseClick = function(eventInfo)
{
    var mouseCurrentHex = this.getMouseHex(eventInfo);
    
    var tile = this._map.getTileAt(mouseCurrentHex.hexX, mouseCurrentHex.hexY);
    if(tile)
        tile.click();
             
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

cartography.floodFill = function (source, range)
{
    var frontier = [];
    var visited = [];

    // add the source to the frontier
    source._tmp = {};
    source._tmp.range = 0;
    frontier.push(source);

    for (var i = 0; i < frontier.length; i++)
    {
        frontier[i].highlight();
        frontier[i]._tmp.visited = true;
        var near = frontier[i].getNeighbours();
        // check that none of them are already visited
        var minRange = null;
        for (var j = 0; j < near.length; j++)
        {
            if (near[j]._tmp)
            {
                if (!minRange || near[j]._tmp.range < minRange)
                    minRange = near[j]._tmp.range;
            }
        }
        minRange++;
        for (var j = 0; j < near.length; j++)
        {
            if (!near[j]._tmp)
            {
                near[j]._tmp = { visited: false, range: minRange }
                if(minRange <= range)
                    frontier.push(near[j]);
            }
        }
    }
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

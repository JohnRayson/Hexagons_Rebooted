var cartography = {};

cartography.settings = function (canvasId, map, spriteSheet)
{
    this._canvas = document.getElementById(canvasId);
    this._ctx = this._canvas.getContext('2d');

    this._ctx.fillStyle = "#000000";
    this._ctx.strokeStyle = "#CCCCCC";
    this._ctx.lineWidth = 1;

    this._map = map;
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
    this.getMouseHex = cartography.getMouseHex;
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
        that.mouseMove(eventInfo);
    });
    this._canvas.addEventListener("mouseout", function (eventInfo)
    {
        that.mouseOut(eventInfo);
    });
}

cartography.go = function (elementId, map, spriteSheet)
{
    var version = new cartography.settings(elementId, map, spriteSheet);
    
    $("#debug").html("hexHeight: " + version._hexHeight + "<br />hexRectangleHeight: " + version._hexRectangleHeight + "<br />hexRectangleWidth: " + version._hexRectangleWidth);

    version.drawBoard();
}

cartography.mouseClick = function(eventInfo)
{
    var mouseCurrentHex = this.getMouseHex(eventInfo);
    alert("x:" + mouseCurrentHex.x + ", y:" + mouseCurrentHex.y + ", hexX:" + mouseCurrentHex.hexX + ", hexY:" + mouseCurrentHex.hexY);
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

                this.drawHexagon(this._mouseLastHex.x, this._mouseLastHex.y, "#000000", 0.5);
            }
        }
    }
}

cartography.mouseOut = function (eventInfo)
{
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this.drawBoard();
}

cartography.getMouseHex = function(eventInfo)
{
    var x, y, hexX, hexY;

    x = eventInfo.offsetX || eventInfo.layerX;
    y = eventInfo.offsetY || eventInfo.layerY;

    hexY = Math.floor(y / (this._hexHeight + this._sideLength));
    hexX = Math.floor((x - (hexY % 2) * this._hexRadius) / this._hexRectangleWidth);

    var mouseCurrentHex = {
        hexX: hexX,
        hexY: hexY,
        x: hexX * this._hexRectangleWidth + ((hexY % 2) * this._hexRadius),
        y: hexY * (this._hexHeight + this._sideLength)
    };

    return mouseCurrentHex;
}

cartography.drawBoard = function()
{
    for (var x = 0; x < this._map._width; ++x)
    {
        for (var y = 0; y < this._map._height; ++y)
        {
            var tile = this._map.getTileAt(x, y);
            var colour = tile._base;

            var hexTopLeft = {
                x: x * this._hexRectangleWidth + ((y % 2) * this._hexRadius),
                y: y * (this._sideLength + this._hexHeight)
            };

            this.drawHexagon(hexTopLeft.x, hexTopLeft.y, colour, 1);
            this.drawSprite(hexTopLeft.x, hexTopLeft.y, tile._vegetation);
            this.drawSprite(hexTopLeft.x, hexTopLeft.y, tile._settlement);
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
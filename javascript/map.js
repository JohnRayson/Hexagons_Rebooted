var map = {};

map.settings = function (width, height)
{
    this._width = width;
    this._height = height;
    this._tiles = []; // of map.tile

    //functions
    this.getTileAt = map.getTileAt;
}

map.tile = function(x, y)
{
    // where is it - so the tile knows its own position
    this._x = x;
    this._y = y;

    // stuff about this tile
    this._base = null;
    this._vegetation = null;
    this._settlement = null;
    this._minerals = {};
    this._agriculture = {};

    // functions
    this.click = map.tileClick;

    
}

map.getTileAt = function (x, y)
{
    for (var i = 0; i < this._tiles.length; i++)
    {
        if (this._tiles[i]._x == x && this._tiles[i]._y == y)
            return this._tiles[i];
    }
}

map.tileClick = function ()
{
    var id = Math.random().toString().substring(3);

    var html = "<div title='You clicked' id='" + id + "' >"
             + "id: " + id + "<br />"
             + "base: " + this._base + "<br />"
             + "vegetation: " + (this._vegetation || "") + "<br />"
             + "settlement: " + (this._settlement || "") + "<br />"
             + "</div>";

    $(html).dialog(
    {
        modal: true,
        close: function () { $(this).empty().remove(); },
        buttons: { "Close": function () { $(this).dialog("close"); } }
    });
}
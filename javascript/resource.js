var resource = {};

resource.grass = function ()
{
    this._colour = "green";
    this.getSprite = function ()
    {
        return "grass";
    }
}

resource.swamp = function ()
{
    this._colour = "green";
    this.getSprite = function ()
    {
        return "swamp";
    }
}

resource.water = function()
{
    this._colour = "blue";
    this.getSprite = function ()
    {
        return "water";
    }
}

resource.forest = function ()
{
    this._colour = "green";
    this.getSprite = function ()
    {
        return "forest";
    }
}

resource.mountain = function ()
{
    this._colour = "#817e6d";
    this.getSprite = function ()
    {
        return "mountain";
    }
}


var resource = {};

resource.getSprite = function ()
{
    return this._sprite;
}
resource.getType = function ()
{
    return this._type;
}

resource.grass = function ()
{
    this._type = "grass";
    this._colour = "green";
    this._sprite = "grass";

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.swamp = function ()
{
    this._type = "swamp";
    this._colour = "green";
    this._sprite = "swamp";

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.water = function()
{
    this._type = "water";
    this._colour = "blue";
    this._sprite = "water";

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.forest = function ()
{
    this._type = "forest";
    this._colour = "green";
    this._sprite = "forest";

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.mountain = function ()
{
    this._type = "mountain";
    this._colour = "#817e6d";
    this._sprite = "mountain";

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}


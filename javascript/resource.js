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
    this._movmentCost = 1;


    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.swamp = function ()
{
    this._type = "swamp";
    this._colour = "green";
    this._sprite = "swamp";
    this._movmentCost = 3;

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.water = function()
{
    this._type = "water";
    this._colour = "blue";
    this._sprite = "water";
    this._movmentCost = 8;

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.forest = function ()
{
    this._type = "forest";
    this._colour = "green";
    this._sprite = "forest";
    this._movmentCost = 2;

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.mountain = function ()
{
    this._type = "mountain";
    this._colour = "#817e6d";
    this._sprite = "mountain";
    this._movmentCost = 5;

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}


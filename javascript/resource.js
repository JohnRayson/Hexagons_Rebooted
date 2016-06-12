var resource = {};
// base model contains client only stuff
resource.baseModel = 
{
    getSprite: function ()
    {
        return this._sprite;
    },
    getType: function ()
    {
        return this._type;
    }
}

// create a resource type
resource.createModel = function (data)
{
    var model = $.extend({}, resource.baseModel, data);
    // allow it to be instancised
    resource[model._type] = function ()
    {
        return model;
    }
}

/*
resource.grass = function ()
{
    this._type = "grass";
    this._colour = "green";
    this._sprite = "grass";
    this._movementCost = 1;

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.swamp = function ()
{
    this._type = "swamp";
    this._colour = "green";
    this._sprite = "swamp";
    this._movementCost = 3;

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.water = function()
{
    this._type = "water";
    this._colour = "blue";
    this._sprite = "water";
    this._movementCost = 8;

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.forest = function ()
{
    this._type = "forest";
    this._colour = "green";
    this._sprite = "forest";
    this._movementCost = 2;

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}

resource.mountain = function ()
{
    this._type = "mountain";
    this._colour = "#817e6d";
    this._sprite = "mountain";
    this._movementCost = 5;

    this.getSprite = resource.getSprite;
    this.getType = resource.getType;

    return this;
}
*/

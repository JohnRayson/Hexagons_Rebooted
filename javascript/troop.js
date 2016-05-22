var troop = {};

troop.getSprite = function ()
{
    return this._sprite;
}



troop.dwarf = function()
{
    this._sprite = "dwarf";

    this._range = 3;
    this._baseRange = 3;

    this._movement = 5;
    this._baseMovement = 5;
    
    // functions
    this.getSprite = troop.getSprite;
    this.reset = function ()
    {
        this._movement = this._baseMovement;
        this._range = this._baseRange;
    }
}
var population = {};

population.settlement = function (inSettings)
{
    var settings = { size: 1, food: 0 };
    $.extend(settings, inSettings);

    this._size = settings.size;
    this._food = settings.food;

    this.getSprite = population.getSprite;
}

population.getSprite = function ()
{
    if (this._size < 5)
        return "hamlet";
    else
        return "village";

}




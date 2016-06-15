using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for Resources
/// </summary>
public class Resource : BaseType
{
    public string _type;
    public string _colour;
    public string _sprite;
    public int _movementCost;
    public int _defenseModifier;
    public int _attackModifier;

    public Resource()
    {
        ModelType = "Resource";
    }
}

public class Grass : Resource
{
    public Grass()
    {
        _type = "grass";
        _colour = "green";
        _sprite = "grass";
        _movementCost = 1;
        _defenseModifier = 0;
        _attackModifier = 0;
    }
}

public class Swamp : Resource
{
    public Swamp()
    {
        _type = "swamp";
        _colour = "green";
        _sprite = "swamp";
        _movementCost = 3;
        _defenseModifier = 5;
        _attackModifier = -1;
    }
}

public class Water : Resource
{
    public Water()
    {
        _type = "water";
        _colour = "blue";
        _sprite = "water";
        _movementCost = 8;
        _defenseModifier = 0;
        _attackModifier = -5;
    }
}

public class Forest : Resource
{
    public Forest()
    {
        _type = "forest";
        _colour = "green";
        _sprite = "forest";
        _movementCost = 2;
        _defenseModifier = 3;
        _attackModifier = 3;
    }
}

public class Mountain : Resource
{
    public Mountain()
    {
        _type = "mountain";
        _colour = "#817e6d";
        _sprite = "mountain";
        _movementCost = 5;
        _defenseModifier = 5;
        _attackModifier = 2;
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// The movable, fighting, people that wander around our map
/// </summary>
public class Troop
{
    // for display
    public string _sprite;
    // for movement
    public int _baseRange;
    public int _baseMovement;
    // for combat
    public double _loyalty;
    public double _attack;
    public double _defense;
}

public class Spearman : Troop
{
    public Spearman()
    {
        _sprite = "spearman";
        _baseRange = 3;
        _baseMovement = 5;
        _attack = 2;
        _defense = 5;
        _loyalty = 10;
    }
}
public class Archer : Troop
{
    public Archer()
    {
        _sprite = "archer";
        _baseRange = 3;
        _baseMovement = 5;
        _attack = 5;
        _defense = 2;
        _loyalty = 10;
    }
}

public class Combat
{
    public Troop attacker, defender;
}
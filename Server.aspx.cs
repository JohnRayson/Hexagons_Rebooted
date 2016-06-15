using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class Server : System.Web.UI.Page
{

    static string datafile;
    protected void Page_Load(object sender, EventArgs e)
    {
        Response.AppendHeader("Content-Type", "application/json");
        datafile = Server.MapPath(@"~/App_Data/db.json");
    }

    // send a model to the client
    [WebMethod]
    public static dynamic GetModel(string type)
    {
        switch (type)
        {
            // base types
            case "Troop": return new Troop();
            case "Resource": return new Resource();

            // troops
            case "Archer": return new Archer();
            case "Spearman": return new Spearman();

            // resources
            case "Grass": return new Grass();
            case "Swamp": return new Swamp();
            case "Water": return new Water();
            case "Forest": return new Forest();
            case "Mountain": return new Mountain();
        }

        return "";
    }

    // resolve a combat
    [WebMethod]
    public static Troop CombatResolution(Combat fight)
    {
        double attackVal = (fight.attacker._attack + fight.attacker._loyalty + fight.attackHex._attackModifier);
        double defenseVal = (fight.defender._defense + fight.defender._loyalty + fight.defenceHex._defenseModifier);

        if (attackVal > defenseVal)
            return fight.attacker;

        return fight.defender;
    }
}
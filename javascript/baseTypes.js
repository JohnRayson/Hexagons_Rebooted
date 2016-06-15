// this holds the baseTypes on the server.
// so we know what to send to the server for instance when we sent an Archer back, we just send the fields in the Troop base type
var baseTypes = {};

baseTypes.createModel = function (data)
{
    // not the same as the others as we can't instantiate these
    baseTypes[data.ModelType] = data;
}
// each object needs to know its own base type, in obj.ModelType -- it does as all of them are derived from BaseType on the server
baseTypes.convertToBase = function (obj)
{
    // clone the ModelType
    var reply = $.extend({}, baseTypes[obj.ModelType]);

    // cycle through its members and copy across the values from the obj passed in
    for(var member in reply)
    {
        reply[member] = obj[member];
    }
    return reply;
}
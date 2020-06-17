//debugger;
console.log(value);
var hex = value.split("-");
var wt = parseInt("0x" + hex[3] + hex[4]);
var final = wt/1000;
//console.log( wt, final )
// The SF-884 only puts out 1 value at the time the item is put on the
// scales
this.lastWeight = "" + final;
console.log("Final weight " + final);
return "" + final;

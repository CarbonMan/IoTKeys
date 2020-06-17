// See SF-884 response.js
// The SF-884 only puts out 1 value at the time the item is put on the
// scales
if (!this.lastWeight) this.lastWeight = "";
return this.lastWeight;
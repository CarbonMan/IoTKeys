console.log("Ebay receiver loaded");
var ebayOrdersCSV = host.getInputFileContents("data/ebayOrders.csv");
var ebayOrders = [];
if (ebayOrdersCSV){
	ebayOrders = Papa.parse(ebayOrdersCSV, {skipEmptyLines:true});
}
this.ebayOrder = function(orderNumber){
  return new EbayOrder();
};
function EbayOrder(){
}

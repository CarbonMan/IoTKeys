console.log("Ebay receiver loaded");
var states=[],statesCSV = host.getInputFileContents("data/states.csv");
if (statesCSV) {
    setTimeout(() => {
        // PapaParse has to load
        states = Papa.parse(statesCSV);
    }, 0);
}
var ebayOrdersCSV = host.getInputFileContents("data/ebayOrders.csv");
var ebayOrders = [];
if (ebayOrdersCSV) {
    setTimeout(() => {
        // PapaParse has to load
        ebayOrders = Papa.parse(ebayOrdersCSV, {
                skipEmptyLines: true
            });
    }, 0);
}
this.ebayOrder = function (orderNumber) {
    // 22-05196-87110
    if (!orderNumber)
        return null;
    var order = ebayOrders.data.find((order) => {
            return order[1] == orderNumber;
        });
    if (order)
        return new EbayOrder(order);
    else
        return null;
    function EbayOrder(order) {
		// No sender is recorded in an ebay order
        this.getReceiver = function () {
			// Convert from a state name to an abbreviation
			var state = states.data.find((s)=>{
				return s[0] == order[17].toUpperCase();
			});
            return {
                name: order[12],
                phone: order[13],
                address1: order[15],
                /* address2: order[15], */
                city: order[16],
                state: state[1],
                postalCode: order[18],
                country: order[19]
            };
        };
    }
};
	

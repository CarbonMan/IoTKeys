console.log("Ebay receiver loaded");
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
this.ebayOrder = function (options) {
    // 22-05196-87110
    var orderNumber = options.orderNumber;

    var country = {};
    var libUrl = options.parameters.libraryUrl;

    if (!orderNumber)
        return null;
    var orders = ebayOrders.data.filter(order => {
            return order[1] == orderNumber;
        });
    if (orders.length)
        return new EbayOrder(orders);
    else
        return null;
    function EbayOrder(orders) {
        // No sender is recorded in an ebay order
        var details = orders[0];
        this.items = [];
        orders.forEach(item => {
            if (item[20]) {
                // ebay multiline orders have a summary line with no item detail
                this.items.push({
                    sku: item[20],
                    description: item[21],
                    qty: item[24]
                });
            }
        });
        this.getReceiver = function () {
			var state, country = me.regions.getCountry(details[19]);
			if (country)
				state = country.getState(details[17]);
            return {
                name: details[12],
                phone: details[13],
                address1: details[15],
                /* address2: order[15], */
                city: details[16],
                stateCode: (state ? state.code: details[17]),
                stateName: (state ? state.code: details[17]),
                postalCode: details[18],
                countryCode: (country ? country.code : details[19]),
                countryName: (country ? country.name : details[19])
            };
        };
    }
};

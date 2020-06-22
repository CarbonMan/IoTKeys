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
        this.getReceiver = function () {
            return {
                name: order[12],
                phone: order[13],
                address1: order[15],
                /* address2: order[15], */
                city: order[16],
                state: order[17],
                postalCode: order[18],
                country: order[19]
            };
        };
    }
};

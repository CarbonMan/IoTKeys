console.log("wooCommerce loaded");
var states = [], statesCSV = host.getInputFileContents("data/states.csv");
if (statesCSV) {
    setTimeout(() => {
        // PapaParse has to load
        states = Papa.parse(statesCSV);
    }, 0);
}
var wooCommerceOrdersCSV = host.getInputFileContents("data/wooCommerce.csv");
var wooCommerceOrders = [];
if (wooCommerceOrdersCSV) {
    setTimeout(() => {
        // PapaParse has to load
        wooCommerceOrders = Papa.parse(wooCommerceOrdersCSV, {
                skipEmptyLines: true
            });
    }, 0);
}
this.wooCommerceOrder = function (orderNumber) {
    // 22-05196-87110
    if (!orderNumber)
        return null;
    var orders = wooCommerceOrders.data.filter(order => {
            return order[1] == orderNumber;
        });
    if (orders.length)
        return new wooCommerceOrder(orders);
    else
        return null;
    function wooCommerceOrder(orders) {
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
            // Convert from a state name to an abbreviation
            var state = states.data.find((s) => {
                    return s[0] == details[17].toUpperCase();
                });
            return {
                name: details[12],
                phone: details[13],
                address1: details[15],
                /* address2: order[15], */
                city: details[16],
                state: state[1],
                postalCode: details[18],
                country: details[19]
            };
        };
    }
};

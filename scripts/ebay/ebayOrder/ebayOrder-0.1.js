console.log("Ebay receiver loaded");
var files = JSON.parse(host.getFiles("data/ebay"));
var ebayOrders = [];
if (files.length && files.length > -1) {
    var ebayOrdersCSV = "";
    var header;
    setTimeout(() => {
        // PapaParse has to load
        files.forEach((f) => {
            var fileCSV = host.getInputFileContents(f);
            if (fileCSV) {
                var lines = fileCSV.split("\n");
                lines.forEach((ln) => {
                    if (!ln || ln.substr(0, 1) == ",")
                        return;
                    if (ln.substr(0, 19) == "Sales Record Number") {
                        if (!header) {
                            header = true;
                            ebayOrdersCSV = ln;
                        }
                    } else if (ln.indexOf("record(s)") == -1 && ln.indexOf("Seller ID") == -1 && ln.substr(0, 4) != ",,,,") {
                        ebayOrdersCSV += "\n" + ln;
                    }
                });
            }
        });
		debugger;
        var orders = Papa.parse(ebayOrdersCSV, {
				header: true,
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
            return order["Order Number"] == orderNumber;
        });
    if (orders.length)
        return new EbayOrder(orders);
    else
        return null;

    function EbayOrder(orders) {
        // No sender is recorded in an ebay order
        var details = orders[0];
        this.orders = orders;
        this.orderNumber = details["Order Number"];
        this.items = [];
        orders.forEach(item => {
            if (item["Item Number"]) {
                // ebay multiline orders have a summary line with no item detail
                this.items.push({
                    sku: item["Item Number"],
                    description: item["Item Title"],
                    qty: item["Quantity"]
                });
            }
        });
        this.load = function (restore) {
            // Some screens (DHL) may jump between pages, and so the order has
            // to be restored from session storage
            for (var i in restore) {
                this[i] = restore[i];
            }
        };
        this.sender = function () {
            return null;
        };
        this.getReceiver = function () {
            var state,
            country = me.regions.getCountry(details["Post To Country"]);
            if (country)
                state = country.getState(details["Post To State"]);
            return {
                name: details["Post To Name"],
                companyName: details["Post To Name"],
                phone: details["Post To Phone"],
                address1: details["Post To Address 2"],
                /* address2: order[15], */
                city: details["Post To City"],
                stateCode: (state ? state.code : details["Post To State"]),
                stateName: (state ? state.name : details["Post To State"]),
                postalCode: details["Post To Postal Code"],
                countryCode: (country ? country.code : details["Post To Country"]),
                countryName: (country ? country.name : details["Post To Country"])
            };
        };
    }
};

this.csvInventory = function (options) {
    return new csvInventory();
};

function csvInventory() {
    var inventory = [],
    inventoryStr;
    try {
        inventoryStr = host.getInputFileContents("data/inventory.csv");
    } catch (e) {
        alert("inventory.csv is in use. Resolve and then restart this screen.\nData corruption may occur");
		throw new Error("Unable to access inventory.csv");
    }
    if (!inventoryStr) {
        inventoryStr = "sku,description,location,supplier,qty";
    }
    inventory = Papa.parse(inventoryStr, {
            header: true
        });
    var orderHistory = [],
    orderHistoryStr;
    try {
        orderHistoryStr = host.getInputFileContents("data/orderHistory.csv");
    } catch (e) {
        alert("orderHistory.csv is in use. Resolve and then restart this screen.\nData corruption may occur");
		throw new Error("Unable to access orderHistory.csv");
    }
    if (!orderHistoryStr) {
        orderHistoryStr = "date,order,sku,location,qty";
    }
    orderHistory = Papa.parse(orderHistoryStr, {
            header: true
        });
    this.removeFromInventory = function (options) {
        // order, sku, quantity
        var locations = [];
        inventory.data.forEach((i) => {
            if (i.sku == options.sku && i.qty > 0) {
                locations.push(i);
            }
        });
        var remaining = options.qty;
        locations.forEach((i) => {
            if (i.qty > 0) {
                var history = {
                    date: formatDate(),
                    order: options.order,
                    sku: options.sku,
                    location: i.location
                };
                if (i.qty - remaining >= 0) {
                    i.qty -= remaining;
                    history.qty = -remaining;
                    remaining = 0;
                } else {
                    i.qty = 0;
                    history.qty = -i.qty;
                    remaining -= i.qty;
                }
                orderHistory.data.push(history);
            }
        });
        if (!locations.length) {
            inventory.data.push({
                sku: options.sku,
                location: "unknown",
                qty: -options.qty
            });
            orderHistory.data.push({
                date: formatDate(),
                order: options.order,
                location: "unknown",
                sku: options.sku,
                qty: options.qty
            });
        }
        //this.save();
    };
    this.save = function () {
        var csv = Papa.unparse(inventory);
        host.strToFile(csv, "data/inventory.csv");
        var csv = Papa.unparse(orderHistory);
        host.strToFile(csv, "data/orderHistory.csv");
    };
    function formatDate() {
        var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }
}

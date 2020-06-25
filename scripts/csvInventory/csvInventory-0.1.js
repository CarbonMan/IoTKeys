this.removeFromInventory = function (options) {
    var inv = new csvInventory();
    inv.removeFromInventory(options);
};

function csvInventory() {
    var inventory = [],
    inventoryStr = host.getInputFileContents("data/inventory.csv");
    if (!inventoryStr) {
        inventoryStr = "sku, description, location, supplier, qty";
    }
    inventory = Papa.parse(inventoryStr, {
            header: true
        });
    var orderHistory = [],
    orderHistoryStr = host.getInputFileContents("data/orderHistory.csv");
    if (!orderHistoryStr) {
        orderHistoryStr = "date, order, sku, location, qty";
    }
    orderHistory = Papa.parse(orderHistoryStr, {
            header: true
        });
    this.removeFromInventory = function (options) {
        // order, sku, quantity
        this.save();
    };
    this.save = function () {
        var csv = Papa.unparse(inventory);
        host.strToFile(csv, "data/inventory.csv");
        var csv = Papa.unparse(orderHistory);
        host.strToFile(csv, "data/inventory.csv");
    };
}

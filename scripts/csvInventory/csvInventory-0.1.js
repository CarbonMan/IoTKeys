this.csvInventory = function (options) {
    return new csvInventory();
};

function csvInventory() {
    var inventory = [],
    inventoryStr;
	debugger;
    try {
        inventoryStr = host.getInputFileContents("data/csvInventory/inventory.csv");
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
    var audit = [],
    auditStr;
    try {
        auditStr = host.getInputFileContents("data/csvInventory/audit.csv");
    } catch (e) {
        alert("audit.csv is in use. Resolve and then restart this screen.\nData corruption may occur");
		throw new Error("Unable to access audit.csv");
    }
    if (!auditStr) {
        auditStr = "date,order,sku,location,qty";
    }
    audit = Papa.parse(auditStr, {
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
                audit.data.push(history);
            }
        });
        if (!locations.length) {
            inventory.data.push({
                sku: options.sku,
                location: "unknown",
                qty: -options.qty
            });
            audit.data.push({
                date: formatDate(),
                order: options.order,
                location: "unknown",
                sku: options.sku,
                qty: options.qty
            });
        }
    };
    this.save = function () {
        var csv = Papa.unparse(inventory);
        host.strToFile(csv, "data/csvInventory/inventory.csv");
        var csv = Papa.unparse(audit);
        host.strToFile(csv, "data/csvInventory/audit.csv");
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

var invoice,
    iotKeys = {
        reads: []
    },
    processes = [],
    processPtr = 0;

$(function () {
    connote.fields('INTER_CHAR').on($db.enums.POST_FIELD_CHANGE, clearAndRead);
});

function clearAndRead() {
    $("#warning").empty();
    iotKeys.reads = [];
    processPtr = 0;
    if (connote.INTER_CHAR) {
        console.log("Request to " + processes[processPtr].id);
		//debugger;
        host.getValueFromDevice(processes[processPtr].id, "next");
    }
}

this.next = function (deviceId, value) {
    console.log("value received from " + processes[processPtr].id + "\n" + value);
    processes[processPtr].result = value;
    if (processPtr < processes.length - 1) {
        // Not all values received
        processPtr++;
        console.log("Request to " + processes[processPtr].id);
        host.getValueFromDevice(processes[processPtr].id, "next");
        return;
    }

    // 2 different use cases have to be dealt with
    // 1. Existing job -> check cubic & weight
    // 2. New job -> apply cubic & weight
    var nWT = 0, nLength = 0, nWidth = 0, nHeight = 0, nItems = 0;
    if (connote.recordset.fields("REFNO").value) {
        // Existing job
        var record = {
            item_qty: 0,
            item_wt: 0,
            length: 0,
            width: 0,
            height: 0
        };
        iotKeys.reads[iotKeys.reads.length] = record;
        // Check weights and item counts
        for (var i = 0; i < processes.length; i++) {
            var prc = processes[i];
            var fld = connote.recordset.fields(prc.field);
            switch (prc.field) {
                case "ITEMS":
                    record.item_qty = Number(prc.result);
                    break;
                case "WEIGHT":
                    record.item_wt = (prc.result ? Number(prc.result): 0);
                    break;
                case "LENGTH":
                    record.length = Number(prc.result) / 100;
                    break;
                case "WIDTH":
                    record.width = Number(prc.result) / 100;
                    break;
                case "HEIGHT":
                    record.height = Number(prc.result) / 100;
                    break;
            }
        }
        // Compare actual values against recorded entries
        var nItems = 0, nWT = 0, newCubic = 0;
        iotKeys.reads.forEach(function (e) {
            newCubic += e.length * e.width * e.height;
            nItems += e.item_qty;
            nWT += e.item_wt;
        });
        var warning = "";
        if (connote.recordset.fields("ITEMS").value != nItems)
            warning = "Items booked: " + connote.recordset.fields("ITEMS").value +
                " items received: " + nItems;
        var orgWt = connote.recordset.fields("WEIGHT").value;
        var avgWt = (orgWt + nWT) / 2;
        var diff = Math.abs((orgWt - nWT) / avgWt);
        if (diff > 0.1) {
            // > 10% difference in weight
            warning += (warning ? "<br/>" : "") +
                "Weight booked: " + orgWt +
                " weight received: " + nWT;
        }
        var orgCubic = connote.recordset.fields("DIMENSIONS").value;
        var avgCubic = (orgCubic + newCubic) / 2;
        diff = Math.abs((orgCubic - newCubic) / avgCubic);
        if (diff > 0.1) {
            // > 10% difference in Cubic
            warning += (warning ? "<br/>" : "") +
                "Cubic booked: " + orgCubic +
                " cubic received: " + newCubic.toFixed(2);
        }
        if (warning) {
            // More to come?
            var warningHtml = warning +
                ' <button  class="ui icon button" id="iotKeysGetNextBtn"><i class="green plus icon"></i></button>' +
                ' <button  class="ui icon button" id="iotKeysSaveBtn"><i class="save icon"></i></button>';
            $("#warning").html(warningHtml);
            $("#iotKeysGetNextBtn").click(function () {
                host.getValueFromDevice(processes[0].id, "next");
            });
            // Set a message into the invoice notes for the job
            $("#iotKeysSaveBtn").click(function () {
                setInvoiceOpsMessage(BOOKING.recordset.fields("REFNO").value, warning, function () { });
            });
        } else
            $("#warning").empty();
    } else {
        // New job
        for (var i = 0; i < processes.length; i++) {
            var prc = processes[i];
            // Custom processing
            switch (prc.field) {
                case "CUBIC":
                    // Can be empty if the Kinect service is offline. If so, the show 
                    // must go on.
                    if (prc.result) {
                        var cubic = JSON.parse(prc.result);
                        var b = cubic.blobs[0];
                        if (b) {
                            // Values come as mm
                            connote.LENGTH = nLength = b.length / 1000;
                            connote.WIDTH = nWidth = b.width / 1000;
                            connote.HEIGHT = nHeight = b.height / 1000;
                            nItems = 1;
                            if (parameters.defaultUnits)
                                connote.ITEM_UNITS = parameters.defaultUnits;
                        }
                    }
                    continue;

                case "TEMP_AND_WEIGHT":
                    if (prc.result) {
                        var result = JSON.parse(prc.result);
                        nWT = result.weight;
                    }
                    continue;
            }
            var fld = connote.recordset.fields(prc.field);
            switch (prc.field) {
                case "ITEMS":
                    //fld.set(prc.result);
                    nItems = Number(prc.result);
                    break;
                case "WEIGHT":
                    //fld.set(prc.result);
                    nWT = Number(prc.result);
                    break;
                case "LENGTH":
                    nLength = Number(prc.result) / 100;
                    fld.set(nLength);
                    break;
                case "WIDTH":
                    nWidth = Number(prc.result) / 100;
                    fld.set(nWidth);
                    break;
                case "HEIGHT":
                    nHeight = Number(prc.result) / 100;
                    fld.set(nHeight);
                    break;
            }
        }

        var nDimensions = nLength * nWidth * nHeight;
        connote.recordset.fields("ITEMS").set(nItems);
        connote.recordset.fields("WEIGHT").set(nWT);
        connote.recordset.fields("DIMENSIONS").set(nDimensions);
    }
}

// What devices are available?
if (parameters.cubic) {
    processes[processes.length] = {
        field: 'CUBIC',
        id: parameters.cubic
    };
}
if (parameters.tempAndWeight) {
    processes[processes.length] = {
        field: 'TEMP_AND_WEIGHT',
        id: parameters.tempAndWeight
    };
}
if (parameters.scales) {
    processes[processes.length] = {
        field: 'WEIGHT',
        id: parameters.scales
    };
}
if (parameters.items) {
    processes[processes.length] = {
        field: 'ITEMS',
        id: parameters.items
    };
}
if (parameters.length) {
    processes[processes.length] = {
        field: 'LENGTH',
        id: parameters.length
    };
}
if (parameters.width) {
    processes[processes.length] = {
        field: 'WIDTH',
        id: parameters.width
    };
}
if (parameters.height) {
    processes[processes.length] = {
        field: 'HEIGHT',
        id: parameters.height
    };
}


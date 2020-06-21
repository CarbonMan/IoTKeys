var processes = [], me = this,
processPtr = 0;
var addOrderActivated;
// window.onload did not fire
// Screen is an Angular app so the weight field is not always on the screen.
this.AP_wtElement = this.AP_lenElement = this.AP_widthtElement = this.AP_htElement = null;
setInterval(() => {
    if (!me.AP_wtElement)
        me.AP_wtElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-weight");
    if (me.AP_wtElement) {
        if (!addOrderActivated) {
            console.log("activated");
            me.AP_lenElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-length");
            me.AP_widthtElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-width");
            me.AP_htElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-height");
            me.AP_ReceiverName = document.getElementById("recipientDetailsForm-name-typeahead-input");
            me.AP_ReceiverAddress = document.getElementById("recipientDetailsForm-addressForm-autoAddressForm-typeahead-input");
            me.AP_ReceiverCountry = document.getElementById("recipientDetailsForm-country-select");

            // Try and load the receiver
            document.getElementById("additionalDetailsForm-domestic-labelInformation")
            .addEventListener('change', (ev) => {
                console.log("Reference focus");
                if (parameters.orderDetails) {
                    var order;
                    if (Array.isArray(parameters.orderDetails)) {
                        parameters.orderDetails.find((rd) => {
                            order = me[rd](ev.target.value);
                            return order;
                        });
                    } else {
                        order = me[parameters.orderDetails](ev.target.value);
                    }
                    if (order) {
                        if (order.getReceiver) {
                            var r = order.getReceiver();
                            var address = r.address1 + "," +
                                (r.address2 ? r.address + "," : "") +
                                r.city + " " + r.state + " " + r.postalCode;
                            angular.element(me.AP_ReceiverAddress).val(address)
                            .scope().apply();
                        }
                    }
                }
            });
            // Get the weight and cubic
            me.AP_wtElement.addEventListener('focus', clearAndRead);

            addOrderActivated = true;
        }
    } else {
        addOrderActivated = false;
    }
}, 1000);

function clearAndRead() {
    iotKeys.reads = [];
    processPtr = 0;
    console.log("Request to " + processes[processPtr].id);
    host.getValueFromDevice(processes[processPtr].id, "next");
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
    var nWT = 0,
    nLength = 0,
    nWidth = 0,
    nHeight = 0,
    nItems = 0;
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
                    nLength = b.length / 1000;
                    angular.element(me.AP_lenElement).val(nLength)
                    .scope().apply();
                    nWidth = b.width / 1000;
                    angular.element(me.AP_widthtElement).val(nWidth)
                    .scope().apply();
                    nHeight = b.height / 1000;
                    angular.element(me.AP_htElement).val(nHeight)
                    .scope().apply();
                    nItems = 1;
                }
            }
            continue;
        }
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
            angular.element(me.AP_lenElement).val(nLength)
            .scope().apply();
            break;
        case "WIDTH":
            nWidth = Number(prc.result) / 100;
            angular.element(me.AP_widthtElement).val(nWidth)
            .scope().apply();
            break;
        case "HEIGHT":
            nHeight = Number(prc.result) / 100;
            angular.element(me.AP_htElement).val(nHeight)
            .scope().apply();
            break;
        }
    }

    angular.element(me.AP_wtElement).val(nWT)
    .scope().apply();
}

// What devices are available?
if (parameters.cubic) {
    processes[processes.length] = {
        field: 'CUBIC',
        id: parameters.cubic
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

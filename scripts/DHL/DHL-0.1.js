var processes = [], me = this,
processPtr = 0;
var addOrderActivated,
DHL_changeEvent = new Event("change");
// window.onload did not fire
// Screen is an Angular app so the weight field is not always on the screen.
this.DHL_wtElement = this.DHL_lenElement = this.DHL_widthtElement = this.DHL_htElement = null;
me.DHL_currentOrder = me.DHL_senderCountry = me.DHL_receiverCountry = null;
me.DHL_bookingReference = "";
me.DHL_currentOrder = null;
me.DHL_inventory = null;
me.DHL_saveBtn = null;
setInterval(() => {
    //if (!me.DHL_senderCountry){
    var countries = document.querySelectorAll("input[ng-model=\"countryCtrl.countryName\"]");
    if (countries.length) {
        me.DHL_senderCountry = countries[0];
        me.DHL_receiverCountry = countries[1];
        if (!me.DHL_senderCountry.value)
            startProcessing();
    }
    if (me.DHL_currentOrder) {
        var btns = document.querySelectorAll(".switcher__label");
        if (btns.length && window.getComputedStyle(btns[1])["background-color"] == "rgb(249, 249, 249)") {
            // Click the "Packages" button
            btns[1].click();
            clearAndRead();
        }
    }
    //}
    /*
    if (!me.DHL_wtElement) {
    me.DHL_wtElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-weight");
    }
    if (!me.DHL_saveBtn) {
    me.DHL_saveBtn = document.querySelector(".ship-selected.primary-button.ng-scope");
    if (me.DHL_saveBtn) {
    me.DHL_saveBtn.addEventListener("click", () => {
    if (me.DHL_inventory) {
    me.DHL_inventory.save();
    }
    });
    }
    }

    if (me.DHL_wtElement) {
    if (!addOrderActivated) {
    addOrderActivated = true;
    var hyper = document.querySelectorAll(".switch-view-button.primary-link");
    hyper.forEach((btn) => {
    btn.click();
    });
    setTimeout(() => {
    document.getElementById("additionalDetailsForm-domestic-labelInformation").focus();
    }, 0);
    console.log("activated");
    me.DHL_lenElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-length");
    me.DHL_widthtElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-width");
    me.DHL_htElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-height");
    me.DHL_ReceiverCountry = document.getElementById("recipientDetailsForm-country-select");

    me.DHL_ReceiverPhone = document.getElementById("recipientDetailsForm-phone");
    var angRphone = angular.element(me.DHL_ReceiverPhone);
    me.DHL_ReceiverName = document.getElementById("recipientDetailsForm-name-typeahead-input");
    var angRname = angular.element(me.DHL_ReceiverName);
    me.DHL_ReceiverAddress = document.getElementById("recipientDetailsForm-addressForm-autoAddressForm-typeahead-input");
    var angRcvr = angular.element(me.DHL_ReceiverAddress);

    // Try and load the receiver
    document.getElementById("additionalDetailsForm-domestic-labelInformation")
    .addEventListener('change', (ev) => {
    console.log("Reference focus");
    if (ev.target.value) {
    me.DHL_bookingReference = ev.target.value;
    clearAndRead();
    if (parameters.orderDetails) {
    var order;
    if (Array.isArray(parameters.orderDetails)) {
    parameters.orderDetails.find((rd) => {
    order = me[rd]({
    parameters: parameters,
    orderNumber: ev.target.value
    });
    return order;
    });
    } else {
    order = me[parameters.orderDetails]({
    parameters: parameters,
    orderNumber: ev.target.value
    });
    }
    me.DHL_currentOrder = order;
    if (order) {
    var DHL_changeEvent = new Event("change");
    if (order.getSender) {
    var s = order.getSender();
    var sndrLine1 = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-line1");
    sndrLine1.value = s.address1;
    sndrLine1.dispatchEvent(DHL_changeEvent);
    var sndrLine2 = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-line2");
    sndrLine2.value = s.address2 || "";
    sndrLine2.dispatchEvent(DHL_changeEvent);
    var sndrLine3 = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-line3");
    sndrLine3.value = s.address3 || "";
    sndrLine3.dispatchEvent(DHL_changeEvent);

    var sSuburbElm = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-locality-suburb");
    sSuburbElm.value = s.city;
    sSuburbElm.dispatchEvent(DHL_changeEvent);
    var sStateElm = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-locality-state");
    sStateElm.value = "string:" + s.stateCode;
    sStateElm.dispatchEvent(DHL_changeEvent);
    var sPostElm = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-locality-postcode");
    sPostElm.value = s.postalCode;
    sPostElm.dispatchEvent(DHL_changeEvent);

    var sNameElm = document.getElementById("senderDetailsForm-name-typeahead-input");
    sNameElm.value = s.postalCode;
    sNameElm.dispatchEvent(DHL_changeEvent);
    }
    if (order.getReceiver) {
    var r = order.getReceiver();
    //var $scope = angular.element(document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-line1")).scope();

    var recvLine1 = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-line1");
    recvLine1.value = r.address1;
    recvLine1.dispatchEvent(DHL_changeEvent);
    var recvLine2 = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-line2");
    recvLine2.value = r.address2 || "";
    recvLine2.dispatchEvent(DHL_changeEvent);
    var recvLine3 = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-line3");
    recvLine3.value = r.address3 || "";
    recvLine3.dispatchEvent(DHL_changeEvent);

    var rSuburbElm = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-locality-suburb");
    rSuburbElm.value = r.city;
    rSuburbElm.dispatchEvent(DHL_changeEvent);
    var rStateElm = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-locality-state");
    rStateElm.value = "string:" + r.stateCode;
    rStateElm.dispatchEvent(DHL_changeEvent);
    var rPostElm = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-locality-postcode");
    rPostElm.value = r.postalCode;
    rPostElm.dispatchEvent(DHL_changeEvent);

    //angRname.val(r.name);
    var elm = document.getElementById("recipientDetailsForm-name-typeahead-input");
    elm.value = r.name;
    elm.dispatchEvent(DHL_changeEvent);
    //angRphone.val(r.phone);
    var elm = document.getElementById("recipientDetailsForm-phone");
    elm.value = r.phone;
    elm.dispatchEvent(DHL_changeEvent);
    //$scope.$apply();
    }
    }
    }
    }
    });
    // Get the weight and cubic
    me.DHL_wtElement.addEventListener('focus', clearAndRead);

    // Inventory processing
    document.querySelector(".primary-button.save-order-button")
    .addEventListener("click", () => {
    if (parameters.inventory) {
    if (!me.DHL_inventory) {
    try {
    me.DHL_inventory = me[parameters.inventory]();
    } catch (e) {
    console.error(e);
    return;
    }
    }
    me.DHL_currentOrder.items.forEach((item) => {
    me.DHL_inventory.removeFromInventory({
    sku: item.sku,
    qty: item.qty,
    order: me.DHL_bookingReference
    });
    });
    }
    }, false);
    }
    } else {
    addOrderActivated = false;
    }
     */
}, 1000);

function startProcessing() {
    var orderNumber = prompt("Enter order number");
    if (!orderNumber)
        return;
    addOrderActivated = true;
    me.DHL_bookingReference = orderNumber;
    if (parameters.orderDetails) {
        var order;
        if (Array.isArray(parameters.orderDetails)) {
            parameters.orderDetails.find((rd) => {
                order = me[rd]({
                        parameters: parameters,
                        orderNumber: me.DHL_bookingReference
                    });
                return order;
            });
        } else {
            order = me[parameters.orderDetails]({
                    parameters: parameters,
                    orderNumber: me.DHL_bookingReference
                });
        }
        me.DHL_currentOrder = order;
        if (me.DHL_currentOrder) {
            DHL_setAddresses();
        }
    }
}

function DHL_setAddresses() {
    var s = me.DHL_currentOrder.getSender();
    var r = me.DHL_currentOrder.getReceiver();
    var addressElms = document.querySelectorAll("input[name=\"address\"]");
    me.DHL_senderCountry.value = s.countryName;
    //debugger;
    me.DHL_senderCountry.dispatchEvent(DHL_changeEvent);
    var cOptions = document.querySelectorAll("a.ie8-typeahead-link.ng-scope");
    cOptions[0].click();
    var senderAddress =
        s.address1 +
        (s.address2 ? s.address2 : "") +
        (s.address3 ? s.address3 : "") +
        ", " + s.city +
        ", " + s.stateCode +
        ", " + s.countryName;
    addressElms[0].value = senderAddress;
    addressElms[0].dispatchEvent(DHL_changeEvent);
    setTimeout(() => {
        // There needs to be a delay while the address is being deciphered.
        var cOptions = document.querySelectorAll("a.ie8-typeahead-link.ng-scope");
        debugger;
        if (cOptions.length) {
            cOptions[0].click();

            me.DHL_receiverCountry.value = r.countryName;
            me.DHL_receiverCountry.dispatchEvent(DHL_changeEvent);
            var cOptions = document.querySelectorAll("a.ie8-typeahead-link.ng-scope");
            cOptions[0].click();

            var receiverAddress =
                r.address1 +
                (r.address2 ? r.address2 : "") +
                (r.address3 ? r.address3 : "") +
                "," + r.city +
                "," + r.stateCode +
                ", " + r.countryName;
            addressElms[1].value = receiverAddress;
            addressElms[1].dispatchEvent(DHL_changeEvent);
            setTimeout(() => {
                var cOptions = document.querySelectorAll("a.ie8-typeahead-link.ng-scope");
                if (cOptions.length) {
                    cOptions[0].click();
                }
            }, 2500);
        }
    }, 2500);
}

function clearAndRead() {
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
    me.DHL_$scope = angular.element(me.DHL_wtElement).scope();
    me.DHL_$ctrl = me.DHL_$scope.$ctrl;
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
                    var elm = document.querySelector("input[name=\"length\"]");
                    elm.value = nLength;
                    elm.dispatchEvent(DHL_changeEvent);

                    nWidth = b.width / 1000;
                    var elm = document.querySelector("input[name=\"width\"]");
                    elm.value = nWidth;
                    elm.dispatchEvent(DHL_changeEvent);

                    nHeight = b.height / 1000;
                    var elm = document.querySelector("input[name=\"height\"]");
                    elm.value = nHeight;
                    elm.dispatchEvent(DHL_changeEvent);

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
            var elm = document.querySelector("input[name=\"weight\"]");
            elm.value = nWT;
            elm.dispatchEvent(DHL_changeEvent);
            //me.DHL_$ctrl.weight = nWT;
            break;
        case "LENGTH":
            nLength = Number(prc.result) / 100;
            var elm = document.querySelector("input[name=\"length\"]");
            elm.value = nLength;
            elm.dispatchEvent(DHL_changeEvent);
            break;
        case "WIDTH":
            nWidth = Number(prc.result) / 100;
            var elm = document.querySelector("input[name=\"width\"]");
            elm.value = nWidth;
            elm.dispatchEvent(DHL_changeEvent);
            break;
        case "HEIGHT":
            nHeight = Number(prc.result) / 100;
            var elm = document.querySelector("input[name=\"height\"]");
            elm.value = nHeight;
            elm.dispatchEvent(DHL_changeEvent);
            break;
        }
    }
    //me.DHL_$scope.$apply();
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

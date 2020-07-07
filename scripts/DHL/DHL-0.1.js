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
me.DHL_receiverName = null;
me.DHL_inventory = null;
me.DHL_saveBtn = null;
var newShipmentTab = false;
setInterval(() => {
    var countries = document.querySelectorAll("input[ng-model=\"countryCtrl.countryName\"]");
    if (countries.length) {
        if (!newShipmentTab) {
            // The new shipment tab should be selected
            newShipmentTab = true;
            var tab = document.querySelector("span[href=\"#/createNewShipmentTab\"]");
            if (tab) {
                tab.click();
                return;
            }
        }
        me.DHL_senderCountry = countries[0];
        me.DHL_receiverCountry = countries[1];
        if (!me.DHL_receiverCountry.value) {
            var button = document.createElement("Button");
            button.innerHTML = "Order";
            button.style = "top:0;right:0;position:absolute;z-index: 9999";
            document.body.appendChild(button);
            button.addEventListener("click", startProcessing);
        }
    }
    if (me.DHL_currentOrder) {
        var btns = document.querySelectorAll(".switcher__label");
        if (btns.length && window.getComputedStyle(btns[1])["background-color"] == "rgb(249, 249, 249)") {
            // Click the "Packages" button
            btns[1].click();
            clearAndRead();
        }
        if (!me.DHL_receiverName) {
            var names = document.querySelectorAll("input[ng-model=\"addressCtrl.attributes.address.name\"]");
            if (names.length) {
                var sender = me.DHL_currentOrder.getSender();
                if (sender) {
                    names[0].value = sender.name;
                    names[0].dispatchEvent(DHL_changeEvent);
                }
                me.DHL_receiverName = names[1];
                var receiver = me.DHL_currentOrder.getReceiver();
                me.DHL_receiverName.value = receiver.name;
                me.DHL_receiverName.dispatchEvent(DHL_changeEvent);
                var cos = document.querySelectorAll("input[ng-model=\"addressCtrl.attributes.address.company\"]");
                if (cos.length) {
                    if (sender) {
                        cos[0].value = sender.companyName || sender.name;
                        cos[0].dispatchEvent(DHL_changeEvent);
                    }
                    cos[1].value = receiver.companyName;
                    cos[1].dispatchEvent(DHL_changeEvent);
                }
                var elms = document.querySelectorAll("input[ng-model=\"addressContactCtrl.model.email\"]");
                if (elms.length) {
                    if (sender) {
                        elms[0].value = sender.email;
                        elms[0].dispatchEvent(DHL_changeEvent);
                    }
                    elms[1].value = receiver.email;
                    elms[1].dispatchEvent(DHL_changeEvent);
                }
                elms = document.querySelectorAll("input[ng-model=\"phoneCodeCtrl.model.phone\"]");
                if (elms.length) {
                    if (sender) {
                        elms[0].value = sender.phone;
                        elms[0].dispatchEvent(DHL_changeEvent);
                    }
                    elms[1].value = receiver.phone;
                    elms[1].dispatchEvent(DHL_changeEvent);
                }
                setTimeout(() => {
                    var elm = document.querySelector("button[ng-bind=\"addressDetailsCtrl.nextButtonText\"]");
                    elm.click();
                }, 1500);
            }
        }
        /*
        if (!waitingConfirmation) {
        // Save the order to sessionStorage because the page reloads
        var successBtn = document.querySelector(".btn.btn_success");
        if (successBtn) {
        waitingConfirmation = true;
        successBtn.addEventListener('click', () => {
        debugger;
        sessionStorage.setItem('IOTKEY_DHL', JSON.stringify(me.DHL_currentOrder));
        });
        }
        }
         */
    } else {
        // Is there an order in session storage?
        var orderStr = sessionStorage.getItem('IOTKEY_DHL');
        if (orderStr) {
            var restore = JSON.parse(orderStr);
            me.DHL_currentOrder = findOrderManagement(restore.orderNumber);
            me.DHL_currentOrder.load(restore);
        }
    }
	// page 3
	if (!me.DHL_wtElement)
		me.DHL_wtElement = document.querySelector("input[ng-model=\"packagingRowCtrl.rowModel.weight\"]");
    if (me.DHL_wtElement && !me.DHL_wtElement.value) {
		clearAndRead();
	}
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
            DHL_setAddresses()
            .then(() => {
                var successBtn = document.querySelector("button[aqa-id=\"dashboardNewShipmentNext\"]");
                //var successBtn = document.querySelector(".btn.btn_success");
                sessionStorage.setItem('IOTKEY_DHL', JSON.stringify(me.DHL_currentOrder));
                setTimeout(() => {
                    successBtn.click();
                }, 1500);
            });
        }
    }
}

function findOrderManagement(orderNumber) {
    var order;
    if (parameters.orderDetails) {
        if (Array.isArray(parameters.orderDetails)) {
            parameters.orderDetails.find((rd) => {
                order = me[rd]({
                        parameters: parameters,
                        orderNumber: orderNumber
                    });
                return order;
            });
        } else {
            order = me[parameters.orderDetails]({
                    parameters: parameters,
                    orderNumber: orderNumber
                });
        }
        me.DHL_currentOrder = order;
    }
    return order;
}

function DHL_setAddresses() {
    return new Promise((resolve, reject) => {
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
            if (cOptions.length) {
                cOptions[0].click();
            }

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
                    resolve();
                } else {
                    reject();
                }
            }, 2500);
            /*            } else {
            reject();
            }
             */
        }, 2500);
    });
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

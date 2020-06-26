var processes = [], me = this,
processPtr = 0;
var addOrderActivated;
// window.onload did not fire
// Screen is an Angular app so the weight field is not always on the screen.
this.AP_wtElement = this.AP_lenElement = this.AP_widthtElement = this.AP_htElement = null;
me.AP_bookingReference = "";
me.AP_currentOrder = null;
me.AP_inventory = null;
me.AP_saveBtn = null;
setInterval(() => {
    if (!me.AP_wtElement) {
        me.AP_wtElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-weight");
    }
    if (!me.AP_saveBtn) {
        me.AP_saveBtn = document.querySelector(".ship-selected.primary-button.ng-scope");
        if (me.AP_saveBtn) {
            me.AP_saveBtn.addEventListener("click", () => {
                if (me.AP_inventory) {
                    me.AP_inventory.save();
                }
            });
        }
    }

    if (me.AP_wtElement) {
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
            me.AP_lenElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-length");
            me.AP_widthtElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-width");
            me.AP_htElement = document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-height");
            me.AP_ReceiverCountry = document.getElementById("recipientDetailsForm-country-select");

            me.AP_ReceiverPhone = document.getElementById("recipientDetailsForm-phone");
            var angRphone = angular.element(me.AP_ReceiverPhone);
            me.AP_ReceiverName = document.getElementById("recipientDetailsForm-name-typeahead-input");
            var angRname = angular.element(me.AP_ReceiverName);
            me.AP_ReceiverAddress = document.getElementById("recipientDetailsForm-addressForm-autoAddressForm-typeahead-input");
            var angRcvr = angular.element(me.AP_ReceiverAddress);

            // Try and load the receiver
            document.getElementById("additionalDetailsForm-domestic-labelInformation")
            .addEventListener('change', (ev) => {
                console.log("Reference focus");
                if (ev.target.value) {
                    me.AP_bookingReference = ev.target.value;
                    clearAndRead();
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
                        me.AP_currentOrder = order;
                        if (order) {
                            var customEvent = new Event("change");
                            if (order.getSender) {
                                var s = order.getSender();
                                var sndrLine1 = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-line1");
                                sndrLine1.value = s.address1;
                                sndrLine1.dispatchEvent(customEvent);
                                var sndrLine2 = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-line2");
                                sndrLine2.value = s.address2 || "";
                                sndrLine2.dispatchEvent(customEvent);
                                var sndrLine3 = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-line3");
                                sndrLine3.value = s.address3 || "";
                                sndrLine3.dispatchEvent(customEvent);

                                var sSuburbElm = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-locality-suburb");
                                sSuburbElm.value = s.city;
                                sSuburbElm.dispatchEvent(customEvent);
                                var sStateElm = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-locality-state");
                                sStateElm.value = "string:" + s.state;
                                sStateElm.dispatchEvent(customEvent);
                                var sPostElm = document.getElementById("senderDetailsForm-addressForm-manualAddressForm-locality-postcode");
                                sPostElm.value = s.postalCode;
                                sPostElm.dispatchEvent(customEvent);

                                var sNameElm = document.getElementById("senderDetailsForm-name-typeahead-input");
                                sNameElm.value = s.postalCode;
                                sNameElm.dispatchEvent(customEvent);
                            }
                            if (order.getReceiver) {
                                var r = order.getReceiver();
                                //var $scope = angular.element(document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-line1")).scope();

                                var recvLine1 = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-line1");
                                recvLine1.value = r.address1;
                                recvLine1.dispatchEvent(customEvent);
                                var recvLine2 = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-line2");
                                recvLine2.value = r.address2 || "";
                                recvLine2.dispatchEvent(customEvent);
                                var recvLine3 = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-line3");
                                recvLine3.value = r.address3 || "";
                                recvLine3.dispatchEvent(customEvent);

                                var rSuburbElm = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-locality-suburb");
                                rSuburbElm.value = r.city;
                                rSuburbElm.dispatchEvent(customEvent);
                                var rStateElm = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-locality-state");
                                rStateElm.value = "string:" + r.state;
                                rStateElm.dispatchEvent(customEvent);
                                var rPostElm = document.getElementById("recipientDetailsForm-addressForm-manualAddressForm-locality-postcode");
                                rPostElm.value = r.postalCode;
                                rPostElm.dispatchEvent(customEvent);

                                //angRname.val(r.name);
                                var elm = document.getElementById("recipientDetailsForm-name-typeahead-input");
                                elm.value = r.name;
                                elm.dispatchEvent(customEvent);
                                //angRphone.val(r.phone);
                                var elm = document.getElementById("recipientDetailsForm-phone");
                                elm.value = r.phone;
                                elm.dispatchEvent(customEvent);
                                //$scope.$apply();
                            }
                        }
                    }
                }
            });
            // Get the weight and cubic
            me.AP_wtElement.addEventListener('focus', clearAndRead);

            // Inventory processing
            document.querySelector(".primary-button.save-order-button")
            .addEventListener("click", () => {
                if (parameters.inventory) {
                    if (!me.AP_inventory) {
						try{
							me.AP_inventory = me[parameters.inventory]();
						}catch(e){
							console.error(e);
							return;
						}
                    }
                    me.AP_currentOrder.items.forEach((item) => {
                        me.AP_inventory.removeFromInventory({
                            sku: item.sku,
                            qty: item.qty,
                            order: me.AP_bookingReference
                        });
                    });
                }
            }, false);
        }
    } else {
        addOrderActivated = false;
    }
}, 1000);

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
    me.AP_$scope = angular.element(me.AP_wtElement).scope();
    me.AP_$ctrl = me.AP_$scope.$ctrl;
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
                    me.AP_$ctrl.length = nLength;
                    //angular.element(me.AP_lenElement).val(nLength)
                    //.scope().apply();
                    nWidth = b.width / 1000;
                    me.AP_$ctrl.width = nWidth;
                    //angular.element(me.AP_widthtElement).val(nWidth)
                    //.scope().apply();
                    nHeight = b.height / 1000;
                    me.AP_$ctrl.height = nHeight;
                    //angular.element(me.AP_htElement).val(nHeight)
                    //.scope().apply();
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
            me.AP_$ctrl.weight = nWT;
            break;
        case "LENGTH":
            nLength = Number(prc.result) / 100;
            me.AP_$ctrl.length = nLength;
            //angular.element(me.AP_lenElement).val(nLength)
            //.scope().apply();
            break;
        case "WIDTH":
            nWidth = Number(prc.result) / 100;
            me.AP_$ctrl.width = nWidth;
            //angular.element(me.AP_widthtElement).val(nWidth)
            //.scope().apply();
            break;
        case "HEIGHT":
            nHeight = Number(prc.result) / 100;
            me.AP_$ctrl.height = nHeight;
            //angular.element(me.AP_htElement).val(nHeight)
            //.scope().apply();
            break;
        }
    }
    me.AP_$scope.$apply();
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

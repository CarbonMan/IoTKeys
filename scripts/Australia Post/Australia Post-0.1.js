var iotKeys = {
    reads: []
},
processes = [],
processPtr = 0;
var addOrderActivated;
// window.onload did not fire
// Screen is an Angular app so the weight field is not always on the screen.
setInterval(() => {
    if (document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-weight")) {
        if (!addOrderActivated) {
            console.log("activated");
            
            // Try and load the receiver
            document.getElementById("additionalDetailsForm-domestic-labelInformation")
            .addEventListener('focus', () => {
                console.log("Reference focus");
                if (parameters.receiverDetails){
                    if (Array.isArray(parameters.receiverDetails)){
                        parameters.receiverDetails.forEach((rd)=>{
                            T$[rd]();
                        });
                    }else{
                        T$[parameters.receiverDetails]();
                    }
                }
            });
            // Get the weight and cubic
            document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-weight")
            .addEventListener('focus',clearAndRead);
            
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
                    document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-length").value = nLength = b.length / 1000;
                    document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-width").value = nWidth = b.width / 1000;
                    document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-height").value = nHeight = b.height / 1000;
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
            document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-length").value = nLength;
            break;
        case "WIDTH":
            nWidth = Number(prc.result) / 100;
            document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-width").value = nWidth;
            break;
        case "HEIGHT":
            nHeight = Number(prc.result) / 100;
            document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-height").value = nHeight;
            break;
        }
    }

    document.getElementById("parcelDetailsForm-domestic-parcelDimensionsForm-weight").value = nWT;
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

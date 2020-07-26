/*
 * See https://github.com/don/BluetoothSerial/blob/master/examples/LED/www/js/index.js
 */
var deviceController = {
	devices: [],
	/**
	 *  @brief List all bluetooth devices
	 */
	list: function (event) {
		var me = this;
		if (me.deviceId)
			me.disconnect();
		app.setStatus("Looking for Bluetooth Devices...");
		if (window.host) {
			var deviceListStr = host.bt_getDevices();
			console.log("Host BT devices", deviceListStr);
			if (deviceListStr) {
				var btDevices = JSON.parse(deviceListStr);
				btDevices.forEach(function (elm) {
					me.devices.push(new Device(elm));
				});
			}
			deviceListStr = host.usb_getDevices();
			console.log("Host USB devices", deviceListStr);
			if (deviceListStr) {
				var usbDevices = JSON.parse(deviceListStr);
				console.log(usbDevices);
				usbDevices.forEach(function (elm) {
					me.devices.push(new Device(elm));
				});
			}
			me.ondevicelist.call(me, me.devices);
		} else
			bluetoothSerial.list(me.ondevicelist.bind(me), app.generateFailureFunction("List Failed"));
	},
	ondevicelist: function (devices) {
		var me = this,
		listItem,
		deviceId;

		// remove existing devices
		var $dl = $("#deviceList")
			.empty();
		$("#devicesDiv").show();
		app.setStatus("");

		me.devices.forEach(function (device) {
			listItem = '<a';
			listItem += ' class="item"';
			if (device.hasOwnProperty("uuid")) { // TODO https://github.com/don/BluetoothSerial/issues/5
				deviceId = device.uuid;
			} else if (device.hasOwnProperty("id")) {
				deviceId = device.id;
			} else if (device.hasOwnProperty("address")) {
				deviceId = device.address;
			} else {
				deviceId = "ERROR " + JSON.stringify(device);
			}
			listItem += ' deviceId="' + deviceId + '"';
			listItem += '><b>' + device.name + "</b><br/><i>" + deviceId + "</i></a>";
			var $a = $(listItem).click(function () {
					var id = $(this).attr('deviceId');
					me.devices.forEach(function (device) {
						if (device.id == id) {
							device.connect();
							return true;
						}
					});
					$("#deviceControllerReady").show();
				});
			$dl.append($a);
		});

		if (devices.length === 0) {
			if (typeof cordova != "undefined") {
				if (cordova.platformId === "ios") { // BLE
					app.setStatus("No Bluetooth Peripherals Discovered.");
				} else { // Android
					app.setStatus("Please Pair a Bluetooth Device.");
				}
			}
		} else {
			app.setStatus("Found " + devices.length + " device" + (devices.length === 1 ? "." : "s."));
		}
	}
	/*,
	connect: function (deviceAddress) {
	app.setStatus("Connecting...");
	console.log("Requesting connection to " + deviceAddress);
	this.deviceId = deviceAddress;
	if (window.host) {
	host.bt_connectDevice(deviceAddress);
	} else {
	bluetoothSerial.connect(deviceAddress, this.onconnect.bind(this), this.ondisconnect.bind(this));
	}
	},
	disconnect: function (event) {
	if (event) {
	event.preventDefault();
	}
	console.log("Disconnecting from " + this.deviceId);
	app.setStatus("Disconnecting...");
	bluetoothSerial.disconnect(this.ondisconnect.bind(this));
	},
	onconnect: function () {
	app.setStatus("Connected.");
	console.log("Connected to " + this.deviceId);
	$(".deviceControllerControl").removeClass("disabled");
	},
	ondisconnect: function () {
	this.deviceId = "";
	console.log("Disconnected from " + this.deviceId);
	$(".deviceControllerControl").addClass("disabled");
	$(".connectionControl").addClass("active");
	app.setStatus("Disconnected.");
	setTimeout(this.list, 2000);
	}
	 */
	/*,
	onWriteSuccess: function(){
	app.setStatus("Message sent");
	},
	onWriteFailure: function(err){
	console.log(err);
	app.setStatus("Message send failed");
	},
	write(string, cb){
	if (this.deviceId){
	if (window.host){
	host.sendCommand(this.deviceId, string);
	}else{
	bluetoothSerial.write(string, cb, ()=>{
	cb("Send failed");
	});
	}
	}
	}
	 */
};

// NS for devices to attach to (see turnTableController.js)
var DeviceTypes = {};

/**
 *  The device with all properties specified by the host.
 */
function Device(org) {
	for (var p in org) {
		this[p] = org[p];
	}
}

Device.prototype.write = function (string, cb) {
	if (this.id) {
		if (window.host) {
			host.sendCommandToDevice(this.id, string, "");
			setTimeout(()=>{
				cb();
				},0);
		} else {
			bluetoothSerial.write(string, cb, () => {
				cb("Send failed");
			});
		}
	}
};
Device.prototype.onWriteSuccess = function () {
	app.setStatus("Message sent");
};
Device.prototype.onWriteFailure = function (err) {
	console.log(err);
	app.setStatus("Message send failed");
};

Device.prototype.connect = function () {
	app.setStatus("Connecting...");
	console.log("Requesting connection to " + this.name);
	//this.deviceId = deviceAddress;
	if (window.host) {
		if (this.deviceAddress) {
			// Make a connection to the BT device.
			host.bt_connectDevice(this.deviceAddress);
		} else {
			// USB devices will be automatically connected.
			this.onconnect();
		}
	} else {
		bluetoothSerial.connect(this.deviceAddress, this.onconnect.bind(this), this.ondisconnect.bind(this));
	}
};
Device.prototype.disconnect = function (event) {
	if (event) {
		event.preventDefault();
	}
	console.log("Disconnecting from " + this.id);
	app.setStatus("Disconnecting...");
	bluetoothSerial.disconnect(this.ondisconnect.bind(this));
};
Device.prototype.onconnect = function () {
	app.setStatus("Connected.");
	console.log("Connected to " + this.id);
	$(".turntableControl").removeClass("disabled");
	// Create a new object of this type.
	//debugger;
	var deviceObject = new DeviceTypes[this.type](this);
	app[this.type.toLowerCase()] = deviceObject;
	//if (window.host) {
	//	host.sendCommandToDevice(this.id, '{"type": "GET_SETTINGS"}', "app." + this.type.toLowerCase() + ".settings");
	//}
};

Device.prototype.ondisconnect = function () {
	//this.deviceId = "";
	console.log("Disconnected from " + this.id);
	$(".turntableControl").addClass("disabled");
	$(".connectionControl").addClass("active");
	app.setStatus("Disconnected.");
	setTimeout(app.deviceController.list, 2000);
};

var app = {
	minimumTimeout:-1,
	blocked: false,
	// simulating may be manually turned on so that the photos are not
	// taken. Useful for troubleshooting.
	simulating: false,
	config: null,
	// Case is important
	turntable: null,
	// Application Constructor
	initialize: function () {
		if (window.host)
			this.onDeviceReady.call(this);
		else
			document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		this.turnTableInterface = new TurnTableDriver(deviceController);
	},
	setConfig: function(){
		this.startBlockingTimer();
	},
	startBlockingTimer: function(){
		var me = this;
		clearTimeout(this.minimumTimeout);
		if (this.config.minimumInterval){
			me.blocked = true;
			this.minimumTimeout = setTimeout(()=>{
				me.blocked = false;
			}, this.config.minimumInterval*1000);
		}
	},
	// deviceready Event Handler
	//
	// Bind any cordova events here. Common events are:
	// 'pause', 'resume', etc.
	onDeviceReady: function () {
		this.deviceController = deviceController;
		deviceController.list();
	},
	timeoutId: 0,
	setStatus: function (status) {
		if (app.timeoutId) {
			clearTimeout(app.timeoutId);
		}
		messageDiv.innerText = status;
		app.timeoutId = setTimeout(function () {
				messageDiv.innerText = "";
			}, 4000);
	},
	generateFailureFunction: function (message) {
		var func = function (reason) {
			var details = "";
			if (reason) {
				details += ": " + JSON.stringify(reason);
			}
			app.setStatus(message + details);
		};
		return func;
	}
};

$(function () {
	app.initialize();
	var storage = window.localStorage;
	var cfg,
	cfgStr = storage.getItem("TurnTable");
	if (cfgStr) {
		try {
			cfg = JSON.parse(cfgStr);
		} catch (e) {
			console.error("Failed to parse config", cfgStr);
		}
	}
	cfg = app.config = (cfg || {});
	console.log(app.config);
	//cfg.stepsPerMotor = cfg.stepsPerMotor || 410;
	//cfg.degreesPerMotorRev = cfg.degreesPerMotorRev || 60;
	for (var k in cfg) {
	    $("#" + k).val(cfg[k]);
	}
	//$("#stepsPerMotor").val(cfg.stepsPerMotor || "");
	//$("#degreesPerMotorRev").val(cfg.degreesPerMotorRev || "");

	$('.tabular.menu .item').tab();

	$("#refreshButton").click(deviceController.list.bind(deviceController));

	//$("#disconnectButton").click(deviceController.disconnect.bind(deviceController));

	$("#rotationControl").click(() => {});

	$("#saveConfig").click(() => {
		//cfg.stepsPerMotor = $("#stepsPerMotor").val();
		//cfg.degreesPerMotorRev = $("#degreesPerMotorRev").val();
		if (app.turntable){
			app.turntable.saveSettings();
		}
		cfg.minimumInterval = $("#minimumInterval").val();
		cfg.rootFolder = $("#rootFolder").val();
		storage.setItem("TurnTable", JSON.stringify(cfg));
		console.log("Saved", cfg);
		app.setConfig();
	});
});

$(document).on("IOTKEY:loaded", () => {
	console.log("IOTKEY loaded. Controller ready to receive commands");
	var progressDialogOpen = false;
	//IOTKEY.valueReceived = function (id, value) {
	IOTKEY.received = function (id, value) {
		console.log(value);
		value = value.replace(/\\"/g, "\"");
		var status = JSON.parse(value);
		switch (status.type) {
		case "movement":
			switch (status.value) {
			case "pause":
				if (window.host) {}
				break;
			case "start":
				if (window.host) {
					// Start live view
					var rootDir = $("#rootFolder").val()
					prjDir = $("#projectID").val();
					var dir = rootDir;
					if (prjDir){
						dir += "\\" + prjDir;
					}
					if (rootDir){
						host.executeDOScommand("\"" + IOTKEY.parameters.digiCamControlLocation +
							"\\CameraControlRemoteCmd.exe\" /c set session.folder " + dir);
						if (prjDir){
							host.executeDOScommand("\"" + IOTKEY.parameters.digiCamControlLocation +
								"\\CameraControlRemoteCmd.exe\" /c set session.filenametemplate \"" + prjDir + "_[Counter 4 digit]\"");
						}
					}
					host.executeDOScommand("\"" + IOTKEY.parameters.digiCamControlLocation +
						"\\CameraControlRemoteCmd.exe\" /c do LiveViewWnd_Show");

				}
				break;
			case "end":
				if (window.host) {
					// Start live view
					host.executeDOScommand("\"" + IOTKEY.parameters.digiCamControlLocation +
						"\\CameraControlRemoteCmd.exe\" /c do LiveViewWnd_Hide");

				}
				break;
			case "paused":
				if (!progressDialogOpen){
					progressDialogOpen = true;
					dialog.dialog( "open" );
				}
				var pausePeriod = $("#pause").val() * 1000;
				updateProgress(+status.remaining, pausePeriod);
				switch(status.remaining){
					case "0":
						dialog
							.dialog( "close" );
						progressbar.progressbar( "value", false );
						progressDialogOpen = false;
						break;
						
					case "2000": 
						if (app.blocked){
							console.log("Capture was blocked through minimum interval setting");
							return;
						}
						if (window.host) {
							var ts =  + new Date();
							// Request that DigiCamControl take a photo
							if (!app.simulating){
								host.executeDOScommand("\"" + IOTKEY.parameters.digiCamControlLocation +
									"\\CameraControlRemoteCmd.exe\" /c do LiveView_Capture");
							}
							//host.executeDOScommand("\"" + IOTKEY.parameters.digiCamControlLocation +
							//	"\\CameraControlRemoteCmd.exe\" /c capture c:\\temp\\" + ts + ".jpg");
							// Make sure the lights don't fire too soon
							app.startBlockingTimer();
						}
						break;
				}
				break;
			}
		break;
		}
	}
});

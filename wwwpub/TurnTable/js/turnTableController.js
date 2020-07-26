"use strict";

/**
 *  Created when a "Turntable" device is connected
 *  See Device.onconnect
 */
DeviceTypes.Turntable = function (device) {
    this.id = device.id;
    this.interface = device;
    var me = this;
	var storage = window.localStorage;
    //this.settings =  function(id, settings){
    this.settings = function (cfgStr) {
        //if (!me.stepsPerGearRevolution){
        console.log("Settings", cfgStr);
        var settings = JSON.parse(cfgStr);
        //me.stepsPerGearRevolution = parseInt(settings.stepsPerMotorRevolution);
		me.stepsPerGearRevolution = parseInt(settings.stepsPerMotor);
        // settings.turnsPerRevolution is the motor turns per platter revolution
        // Get the # of degrees in a single rotation
        //me.degreesPerMotorRotations = 360 / settings.turnsPerRevolution;
		me.degreesPerMotorRotations = 360 / parseInt(settings.degreesPerMotorRev);
        me.calculateSteps();
        for (var k in settings) {
            $("#" + k).val(settings[k]);
        }
    };
    me.saveSettings = function () {
        var cfg = {
            stepsPerMotor: $("#stepsPerMotor").val(),
            degreesPerMotorRev: $("#degreesPerMotorRev").val()
        };
		var cfgStr = JSON.stringify(cfg);
        storage.setItem(me.id, cfgStr);
		me.settings(cfgStr);
    };
    me.calculateSteps = function () {
        // # of steps per gear revolution / # of platter degrees in 1 revolution = # steps per degrees
        // 2000 steps for 1 revolution / 90 degrees = 22 steps for 1 degree
        me.stepsPerDegree = parseInt(me.stepsPerGearRevolution / me.degreesPerMotorRotations);
        // A full rotation is then stepsPerDegree * 360
        me.stepsPerRotation = 360 * me.stepsPerDegree;
        //me.stepsPerRotation = (360 / me.degreesPerMotorRotations) * me.stepsPerGearRevolution;
    };
    if (device.parameters) {
        // The device parameters specify the motor steps and gear ratios
        me.stepsPerGearRevolution = device.parameters.stepsPerMotorRev;
        me.degreesPerMotorRotations = device.parameters.degreesPerMotorRev;
        me.calculateSteps();
    }
    Device.call(me);
    var cfgStr = storage.getItem(this.id);
    if (cfgStr)
        this.settings(cfgStr);
};
DeviceTypes.Turntable.prototype = Object.create(Device.prototype);

class TurnTableDriver {
    constructor(_deviceController) {
        /*
        this.stepsPerGearRevolution = 410;
        this.degreesPerMotorRotations = 60;
        this.stepsPerDegree = parseInt(this.stepsPerGearRevolution / this.degreesPerMotorRotations);
        this.stepsPerRotation = (360 / this.degreesPerMotorRotations) * this.stepsPerGearRevolution;
         */
        this.deviceController = _deviceController;
        $("#turnOn").click(this.run.bind(this));

        $("#turnOff").click(this.stop.bind(this));
        $("#moveSteps").click(this.stepForm.bind(this));
        $("#startSession").click(this.stepAndWait.bind(this));
        $("#turnTableRotations").click(this.turnTableRotation.bind(this));
        $("#pauseSequence").click(this.pauseSequence.bind(this));
        $("#resume").click(this.resume.bind(this));
    }
}

TurnTableDriver.prototype.motorSetup = function (cb) {
    if (!app.turntable) {
        console.error("No turntable selected");
        return;
    }
    var deviceCfg = '{"type":"CONFIG",' +
        '"stepsPerMotorRevolution":' + app.turntable.stepsPerGearRevolution + "," +
        '"turnsPerRevolution":' + parseInt(360 / app.turntable.degreesPerMotorRotations) +
        '}';
    // stepsPerMotorRevolution = The # of steps to get 1 revolution of the motor (usually 360/1.8)
    // turnsPerRevolution = The # of motor rotations to get 1 revolution of the turntable
    console.log(deviceCfg);
    app.turntable.write(deviceCfg, (err) => {
        setTimeout(cb, 500);
    });
}

TurnTableDriver.prototype.stepAndWait = function () {
    this.motorSetup(() => {
        var speedPercent = $("#speedPercent").val() || 0;
        var req = '{"type":"SPEED"' +
            ', "percent":' + speedPercent +
            '}';

        console.log(req);
        app.turntable.write(req, (err) => {
            // The timeout is required, otherwise the message doesn't get transmitted
            setTimeout(() => {
                var stopsPer360 = $("#stopsPer360").val();
                var pause = $("#pause").val();
                var req = '{"type":"stepAndWait"' +
                    ', "count":' + stopsPer360 +
                    ', "motorSteps":' + parseInt((360 / stopsPer360) * app.turntable.stepsPerDegree) +
                    ', "wait":' + (pause * 1000) +
                    '}';

                console.log(req);
                app.turntable.write(req, (err) => {
                    if (err & err != "OK")
                        console.log(err);
                });
            }, 1500);
        });
    });
}

TurnTableDriver.prototype.stepForm = function (steps) {
    var steps = $("#steps").val();
    this.steps(steps);
}

TurnTableDriver.prototype.steps = function (steps) {
    this.motorSetup(() => {
        app.turntable.write('{"type":"STEP", "count":' + steps + '}', (err) => {
            if (err & err != "OK")
                console.log(err);
        });
    });
}

TurnTableDriver.prototype.turnTableRotation = function () {
    this.motorSetup(() => {
        var rotations = $("#rotations").val();
        var steps = rotations * app.turntable.stepsPerRotation;
        app.turntable.write('{"type":"STEP", "count":' + steps + '}', (err) => {
            if (err & err != "OK")
                console.log(err);
        });
    });
}

TurnTableDriver.prototype.run = function () {
    this.motorSetup(() => {
        app.turntable.write('{"type":"RUN"}', (err) => {
            if (err & err && err != "OK")
                console.log(err);
        });
    });
};

TurnTableDriver.prototype.stop = function () {
    if (!app.turntable) {
        console.log("No turntable selected");
        return;
    }
    app.turntable.write('{"type":"STOP"}', (err) => {
        if (err && err != "OK")
            console.log(err);
    });
};

TurnTableDriver.prototype.pauseSequence = function () {
    if (!app.turntable) {
        console.log("No turntable selected");
        return;
    }
    app.turntable.write('{"type":"PAUSE"}', (err) => {
        if (err && err != "OK")
            console.log(err);
    });
};

TurnTableDriver.prototype.resume = function () {
    if (!app.turntable) {
        console.log("No turntable selected");
        return;
    }
    app.turntable.write('{"type":"RESUME"}', (err) => {
        if (err && err != "OK")
            console.log(err);
    });
};

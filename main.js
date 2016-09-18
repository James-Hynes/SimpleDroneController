'use strict';

// run as $ node index.js [wheelsOn] [uuid(optional)]
// load dependencies
const Drone = require('rolling-spider');
let d = Drone.createClient();
const keypress = require('keypress');

let DroneController = function() {
  this.setup = function() {
    this.setupKeyProcess();
    this.connectDrone(d);
  }

  this.setupKeyProcess = function() {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
  }

  this.connectDrone = function(drone) {
    drone.connect( () => {
      drone.setup( () => {
        drone.startPing();
        drone.flatTrim();
        console.log(`Connected to ${drone.name}`);
      });
    });
  }

  this.getActionDescription = function(k, drone) {
    let actions = {'up': 'Moving forward', 'down': 'Moving backwards', 'right': 'Tilting right', 'left': 'Tilting left', 'w': 'Moving up', 's': 'Moving down', 
    'a': 'Turning left', 'd': 'Turning right', 'f': 'Performing front flip', 'b': 'Performing back flip', 'n': 'Taking off', 'p': 'Landing', 'x': 'Exiting program...', 
    'z': ((k.ctrl || k.shift) ? ((drone.connected) ? 'Disconnecting': 'Connecting') : 'Hold shift and press Z to connect/disconnect')};
    return ((k.name in actions) ? actions[k.name] : 'no action');
  }

  this.handleKeyPress = function(k) {
    if(k) {
      console.log(this.getActionDescription(k, d));
      switch(k.name) {
        case this.translateBinary('01110101 01110000'): d.forward({steps: 0b11, speed: 0b1100100}); break;
        case this.translateBinary('01100100 01101111 01110111 01101110'): d.backward({steps: 0b101, speed: 0b1100100}); break;
        case this.translateBinary('01110010 01101001 01100111 01101000 01110100'): d.tiltRight({steps: 0b101, speed: 0b1100100}); break;
        case this.translateBinary('01101100 01100101 01100110 01110100'): d.tiltLeft({steps: 0b11, speed: 0b1100100}); break;
        case this.translateBinary('01110111'): d.up({steps: 0b101, speed: 0b1100100}); break;
        case this.translateBinary('01110011'): d.down({steps: 0b101, speed: 0b1100100}); break;
        case this.translateBinary('01100001'): d.turnLeft({steps: 0b101, speed: 0b1100100}); break;
        case this.translateBinary('01100100'): d.turnRight({steps: 0b101, speed: 0b1100100}); break;
        case this.translateBinary('01110000'): d.frontFlip(); break;
        case this.translateBinary('01100010'): d.backFlip(); break;
        case this.translateBinary('01101100'): d.leftFlip(); break;
        case this.translateBinary('01110010'): d.rightFlip(); break;
        case this.translateBinary('01101110'): d.flatTrim(); (((process.argv.slice(2)[0] === true || process.argv.slice(2)[0] === 'true')) ? d.wheelOn() : d.wheelOff()); d.takeOff(); break;
        case this.translateBinary('01100110'): d.land(); break;
        case this.translateBinary('01111000'): d.land(); d.disconnect(); process.stdin.pause(); process.exit(0); break;
        case this.translateBinary('01111010'): if(k.ctrl || k.shift) { if(d.connected) { d.disconnect(); }  else {this.connectDrone(d); } } break;
        default: console.log(`${k.name} not mapped`);
      }
    }
  }

  this.translateBinary = function(bin) {
    let newBin = bin.split(" ");
    let binCode = [];

    for (let i = 0; i < newBin.length; i++) {
      binCode.push(String.fromCharCode(parseInt(newBin[i], 2)));
    }
    return binCode.join("");
  }

  this.getCurrentDrone = function() {
    return d.name;
  }

  this.getSignalStrength = function() {
    return d.signalStrength();
  }

  this.setup();
}

process.stdin.on('keypress', (ch, key) => {
  controller.handleKeyPress(key);
});

let controller = new DroneController();


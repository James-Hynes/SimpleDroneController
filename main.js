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
        case 'up': d.forward({steps: 5, speed: 100}); break;
        case 'down': d.backward({steps: 5, speed: 100}); break;
        case 'right': d.tiltRight({steps: 5, speed: 100}); break;
        case 'left': d.tiltLeft({steps: 5, speed: 100}); break;
        case 'w': d.up({steps: 5, speed: 100}); break;
        case 's': d.down({steps: 5, speed: 100}); break;
        case 'a': d.turnLeft({steps: 5, speed: 100}); break;
        case 'd': d.turnRight({steps: 5, speed: 100}); break;
        case 'f': d.frontFlip(); break;
        case 'b': d.backFlip(); break;
        case 'l': d.leftFlip(); break;
        case 'r': d.rightFlip(); break;
        case 'n': d.flatTrim(); (((process.argv.slice(2)[0] === true || process.argv.slice(2)[0] === 'true')) ? d.wheelOn() : d.wheelOff()); d.takeOff(); break;
        case 'p': d.land(); break;
        case 'x': d.land(); d.disconnect(); process.stdin.pause(); process.exit(0); break;
        case 'z': if(k.ctrl || k.shift) { if(d.connected) { d.disconnect(); }  else {this.connectDrone(d); } } break;
        default: console.log(`${k.name} not mapped`);
      }
    }
  }

  function binaryAgent(str) {
    let newBin = str.split(" ");
    let binCode = [];

    for (i = 0; i < newBin.length; i++) {
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


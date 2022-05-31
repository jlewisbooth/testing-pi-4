const dgram = require("dgram");
const config = require("../config.json");
const EventEmitter = require("events");

// create datagram server
const server = dgram.createSocket("udp4");
server.bind(config.udp.port);

class UDPServer extends EventEmitter {
  constructor() {
    this.server = server;
    this.subscribers = [];

    this.server.on("message", (msg, rinfo) => {
      let packet = JSON.parse(msg);
      console.log("Recieved a datagram packet:", packet);
    });
  }

  sendPacket(packet) {
    let msg = JSON.stringify(packet);
    for (let sub of this.subscribers) {
      this.server.send(msg, 0, msg.length, sub.port, sub.address);
    }
  }
}

module.exports = UDPServer;

const dgram = require("dgram");
const config = require("../config.json");
const EventEmitter = require("events");
const redis = require("redis");

function getRedisClient() {
  return redis.createClient();
}

// create datagram server
const server = dgram.createSocket("udp4");
server.bind(config.udp.port);

class UDPServer extends EventEmitter {
  constructor() {
    super();

    this.server = server;
    this.subscribers = [];

    this.server.on("message", this._handleGramPacket.bind(this));

    this.initiateClient();

    this.publishChannel = config.tags.fromSensor + "ub.model-uk.tower-bridge";
  }

  async initiateClient() {
    await this._ensureRedisClient();
  }

  async _ensureRedisClient() {
    if (!this.redisPublisher) {
      this.redisPublisher = getRedisClient();

      await this.redisPublisher.connect();
    }
  }

  _handleGramPacket(msg) {
    // only expecting packets from ub.model-uk.tower-bridge
    // msg not parsed for now

    this.redisPublisher.publish(this.publishChannel, msg.toString("binary"));
  }

  sendPacket(packet) {
    let msg = JSON.stringify(packet);
    for (let sub of this.subscribers) {
      this.server.send(msg, 0, msg.length, sub.port, sub.address);
    }
  }

  close() {
    if (this.redisClient) {
      this.redisClient.unsubscribe();
      this.redisClient.quit();
    }

    if (this.redisPublisher) {
      this.redisPublisher.unsubscribe();
      this.redisPublisher.quit();
    }
  }
}

module.exports = UDPServer;

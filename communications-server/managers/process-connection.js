const redis = require("redis");
const EventEmitter = require("events").EventEmitter;
const conf = require("../config.json");

function getRedisClient() {
  return redis.createClient();
}

class ProcessConnection extends EventEmitter {
  constructor() {
    super();
  }

  publish(locationId, packet) {
    if (!locationId) {
      console.log("Can't subscribe to this location:", locationId);

      return;
    }

    this._ensureRedisClient();

    let channel = `${conf.tags.fromSensor}|${locationId}`;
    this.redisPublisher.publish(channel, JSON.stringify(packet));
  }

  subscribe(locationId) {
    if (!locationId) {
      console.log("Can't subscribe to this location:", locationId);

      return;
    }

    this._ensureRedisClient();

    let channel = `${conf.tags.fromClient}|${locationId}`;
    this.redisClient.subscribe(channel);
  }

  _ensureRedisClient() {
    if (!this.redisClient) {
      this.redisClient = getRedisClient();
      this.redisClient.on("message", this._handleRedisMessage.bind(this));
      this.redisPublisher = getRedisClient();
    }
  }

  _handleRedisMessage(channel, msg) {
    let packet = JSON.parse(msg);

    this.emit("message", {
      locationId: channel,
      type: packet.type,
      data: {
        ...packet.data,
      },
    });
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

module.exports = ProcessConnection;

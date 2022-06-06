const redis = require("redis");
const EventEmitter = require("events").EventEmitter;
const conf = require("../config.json");

function getRedisClient() {
  return redis.createClient();
}

class ClientConnection extends EventEmitter {
  constructor({ clientId } = {}) {
    super();

    this.initiateClient();

    this.clientId = clientId || "Unknown Client";
  }

  async initiateClient() {
    await this._ensureRedisClient();
  }

  async _ensureRedisClient() {
    if (!this.redisClient) {
      this.redisClient = getRedisClient();
      this.redisClient.addListener(
        "message",
        this._handleRedisMessage.bind(this)
      );

      this.redisPublisher = getRedisClient();

      await this.redisClient.connect();
      await this.redisPublisher.connect();
    }
  }

  subscribe(locationId) {
    if (!locationId) {
      console.log("Can't subscribe to this location:", locationId);

      return;
    }

    this._ensureRedisClient();

    let channel = `${conf.tags.toClient}|${locationId}`;

    console.log(`${this.clientId} subscribing to channel: `, channel);

    this.redisClient.subscribe(channel, this._handleRedisMessage.bind(this));
  }

  _handleRedisMessage(msg, channel) {
    console.log("CLIENT MESSAGE", msg);

    let packet = msg;
    if (typeof msg === "string") {
      packet = JSON.parse(msg);
    }

    console.log({
      locationId: channel,
      type: packet.type,
      data: {
        ...packet.data,
      },
    });

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

module.exports = ClientConnection;

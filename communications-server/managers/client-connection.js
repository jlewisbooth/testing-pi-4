const redis = require("redis");
const EventEmitter = require("events").EventEmitter;

function getRedisClient() {
  return redis.createClient();
}

class ClientConnection extends EventEmitter {
  constructor() {
    super();
  }

  _ensureRedisClient() {
    if (!this.redisClient) {
      this.redisClient = getRedisClient();
      this.redisClient.on("message", this._handleRedisMessage.bind(this));

      this.redisPublisher = getRedisClient();
    }
  }

  _handleRedisMessage(channel, msg) {
    this.emit("message", {
      channel,
      packet: JSON.parse(msg),
    });
  }

  close() {
    if (this.redisClient) {
      this.redisClient.unsubscribe();
      this.redisClient.quit();
    }
  }
}

module.exports = ClientConnection;

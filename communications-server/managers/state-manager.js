const redis = require("redis");
const conf = require("../config.json");

function getRedisClient() {
  return redis.createClient();
}

class StateManager {
  constructor() {
    this._ensureRedisClient();

    this.state = {
      direction: 1,
      lastKnownPosition: "ub.model-uk.glasgow-station",
    };

    // listen to raw tower bridge data
    this.subscribe("ub.model-uk.tower-bridge");
  }

  getState() {}

  publish(locationId, packet) {
    if (!locationId) {
      console.log("Can't subscribe to this location:", locationId);

      return;
    }

    this._ensureRedisClient();

    let channel = `${conf.tags.toClient}|${locationId}`;
    this.redisPublisher.publish(channel, JSON.stringify(packet));
  }

  subscribe(locationId) {
    if (!locationId) {
      console.log("Can't subscribe to this location:", locationId);

      return;
    }

    this._ensureRedisClient();

    let channel = `${conf.tags.fromSensor}|${locationId}`;
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
    console.log("MESSAGE STATE MANAGER", channel, msg);
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

let stateManager = new StateManager();

function getStateManager() {
  return stateManager;
}

module.exports = {
  getStateManager,
};

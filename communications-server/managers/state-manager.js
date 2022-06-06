const redis = require("redis");
const conf = require("../config.json");

function getRedisClient() {
  return redis.createClient();
}

class StateManager {
  constructor() {
    this.initiateClient();

    this.state = {
      direction: 1,
      lastKnownPosition: "ub.model-uk.glasgow-station",
    };
  }

  getState() {}

  async initiateClient() {
    await this._ensureRedisClient();

    this.setUpSubscribers();
  }

  setUpSubscribers() {
    // listen to raw tower bridge data
    this.subscribe("ub.model-uk.tower-bridge");
    this.subscribe("ub.model-uk.leeds");
    this.subscribe("ub.model-uk.glasgow-station");
  }

  publish(locationId, packet) {
    if (!locationId) {
      console.log("Can't subscribe to this location:", locationId);

      return;
    }

    this._ensureRedisClient();

    let channel = `${conf.tags.toClient}|${locationId}`;

    console.log("PUBLISHING STATE MANAGER", channel);

    this.redisPublisher.publish(channel, JSON.stringify(packet));
  }

  subscribe(locationId) {
    if (!locationId) {
      console.log("Can't subscribe to this location:", locationId);

      return;
    }

    this._ensureRedisClient();

    let channel = `${conf.tags.fromSensor}|${locationId}`;

    console.log("State Manager subscribing to channel: ", channel);

    this.redisClient.subscribe(channel, this._handleRedisMessage.bind(this));
  }

  async _ensureRedisClient() {
    if (!this.redisClient) {
      this.redisClient = getRedisClient();
      this.redisPublisher = getRedisClient();

      await this.redisClient.connect();
      await this.redisPublisher.connect();
    }
  }

  _handleRedisMessage(channel, msg) {
    let channelComs = channel.split("|");

    console.log("STATE MANAGER", channel, msg);

    if (channelComs[0] === conf.tags.fromSensor) {
      let locationId = channelComs[1];
      this.publish(`${conf.tags.toClient}|${locationId}`, msg);

      console.log("MESSAGE STATE MANAGER", channel, msg);
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

let stateManager = new StateManager();

function getStateManager() {
  return stateManager;
}

module.exports = {
  getStateManager,
};

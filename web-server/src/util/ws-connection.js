import { EventEmitter } from "events";
import processLocation from "./process-location";

const log = (msg) => console.log(`ub-client :- ${msg}`);

function heartbeat() {
  clearTimeout(this.pingTimeout);
  console.log("HEART BEAT");

  this.pingTimeout = setTimeout(() => {
    console.log("TERMINATING WS");
    this.terminate();
  }, 33e4);
}

class WebsocketConnection extends EventEmitter {
  constructor({
    host = "wss://utterberry.io/",
    path = "api/v3/measurement",
    secure = true,
    debug = false,
    verbose = false,
    reconnectInterval = 1 * 1000,
  } = {}) {
    super();
    this.location = host;
    this.path = path;
    this.secure = secure;

    this._debug = debug;
    this._verbose = debug && verbose;

    this.reconnectInterval = reconnectInterval;

    this.subscriptions = [];
    this.subscriptionsToSend = [];

    this._startupMsgs = [];

    this._disconnect();

    Object.assign(this, processLocation(this.location, "ws", this.secure));

    this.connect();
  }

  connect(msg) {
    if (typeof msg === "object") {
      msg = JSON.stringify(msg);
    }
    this._connectionMessage = msg;

    if (this._connecting) {
      return this._connectionPromise;
    }

    this._connecting = true;

    if (this.ws && this.ws.removeAllListeners) {
      this.ws.removeAllListeners();
      clearTimeout(this.ws.pingTimeout);
    }

    if (this._debug) {
      log(`Attempting to connect to websocket: ${this.location}${this.path}`);
    }

    this.ws = new WebSocket(this.location + this.path);

    const onOpen = () => {
      this.emit("connect", this);
      if (this._connectionMessage) {
        this.ws.send(this._connectionMessage);
      }
    };

    if (this.ws.on) {
      console.log("THERE");
      this.ws.on("open", () => {
        this.emit("connect", this);
        if (this._connectionMessage) {
          this.ws.send(this._connectionMessage);
        }
      });
      this.ws.on("ping", heartbeat);
      this.ws.on("error", this._reconnect.bind(this));
      this.ws.on("message", this._onMessage.bind(this));
      this.ws.on("close", this._reconnect.bind(this));
    } else {
      console.log("HERE");
      this.ws.onopen = onOpen;
      this.ws.onerror = this._reconnect.bind(this);
      this.ws.onmessage = (msg) => {
        this._onMessage(msg.data);
      };
      this.ws.onclose = this._reconnect.bind(this);
      this.ws.addEventListener("ping", () => {
        console.log("JUST BEEN PINGED");
      });
    }
    return this._connectionPromise;
  }

  async _reconnect(e) {
    this._disconnect();
    if (!this._willReconnect && this.ws.readyState !== 1) {
      this._willReconnect = true;
      if (this._debug) {
        console.log(e);
        log(`Websocket closed: ${e}.`);
        log(
          `Will reconnect in ${this.reconnectInterval}ms ` +
            `(${this.location}${this.path})`
        );
      }

      setTimeout(() => {
        this.connect();
        this._willReconnect = false;
      }, this.reconnectInterval);
    }
  }

  _onMessage(msg) {
    if (this._debug && this._verbose) {
      console.log("RECV", msg);
    }
    msg = JSON.parse(msg);
    if (msg.error && msg.status == 401) {
      this._disconnect();
      return this.emit("auth-error", msg);
    }
    if (msg.connect && msg.status == 200) {
      if (this._debug) {
        log(`Websocket connected (${this.location}${this.path})`);
      }

      this.isConnected = true;
      this._connectionPromiseResolve(this);
      this._resendStartupMessages();
      return this.emit("connected", msg);
    }

    this.emit("packet", msg);
    if (msg.type) {
      this.emit(msg.type, msg);
    }
  }

  listen(clientId) {
    return this.sendAtStartup({
      type: "subscribe",
      clientId,
    });
  }

  async _resendStartupMessages() {
    for (let sm of this._startupMsgs) {
      // this is awaited so that if a startup message requires an acknowledge
      // the resending pauses until
      await this.send(sm.msg, sm.opts);
      if (sm.resolveSend) {
        sm.resolveSend();
      }
    }

    this._startupMsgsPromiseResolve();
  }

  async _send(msg) {
    if (typeof msg !== "string") {
      msg = JSON.stringify(msg);
    }
    if (this._debug && this._verbose) {
      console.log("SEND", msg);
    }
    await this._connectionPromise;
    return new Promise((resolve) => {
      this.ws.send(msg, resolve);
    });
  }

  async send(msg, { acknowledge, intv = 1000, afterStartup = false } = {}) {
    if (!msg) {
      return;
    }

    if (afterStartup && this._startupMsgsPromise) {
      await this._startupMsgsPromise;
    }

    if (acknowledge) {
      return new Promise((resolve, reject) => {
        let checkAck,
          keepSending = true,
          sendMsg = async () => {
            await this._send(msg);
            setTimeout(() => {
              if (keepSending) {
                sendMsg();
              }
            }, intv);
          };
        const sated = (ackMsg) => {
          this.removeListener("packet", checkAck);
          keepSending = false;
          resolve(ackMsg);
        };
        if (typeof acknowledge == "string") {
          checkAck = (ackMsg) => {
            if (ackMsg.type === acknowledge) {
              sated(ackMsg);
            }
          };
        } else if (typeof acknowledge === "function") {
          checkAck = (ackMsg) => {
            if (acknowledge(ackMsg)) {
              sated(ackMsg);
            }
          };
        }
        if (checkAck) {
          this.on("packet", checkAck);
          sendMsg();
        } else {
          return reject("Acknowledge option invalid");
        }
      });
    } else {
      return this._send(msg);
    }
  }

  sendAtStartup(msg, opts) {
    let resolve,
      sentProm = new Promise((res) => (resolve = res));
    (async () => {
      this._startupMsgs.push({ msg, opts, resolveSend: resolve });
      if (this.isConnected) {
        await this.send(msg, opts);
        resolve();
      }
    })();
    return sentProm;
  }

  _disconnect() {
    this._connecting = false;
    this.isConnected = false;
    let oldPromResolve = this._connectionPromiseResolve;
    this._connectionPromise = new Promise((res) => {
      this._connectionPromiseResolve = res;
    });
    if (oldPromResolve) {
      this._connectionPromise.then(oldPromResolve);
    }
    let oldStartupPromResolve = this._startupMsgsPromiseResolve;
    this._startupMsgsPromise = new Promise((res) => {
      this._startupMsgsPromiseResolve = res;
    });
    if (oldStartupPromResolve) {
      this._startupMsgsPromise.then(oldStartupPromResolve);
    }
  }
}

export default WebsocketConnection;

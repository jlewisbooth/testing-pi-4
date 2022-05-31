const express = require("express");
const ProcessConnection = require("../managers/process-connection");

const router = express.Router();

const noop = () => {};

router.ws("/", (ws, req) => {
  console.log("Process Connection");

  function send(packet) {
    if (typeof packet !== "string") {
      packet = JSON.stringify(packet);
    }
    console.log("SEND", packet);
    if (ws.readyState === 1) {
      ws.send(packet);
    }
  }

  send({
    connect: true,
    status: 200,
  });

  let wsContext = {
    stopPing() {
      if (this.pingInterval) {
        clearInterval(this.pingInterval);
        this.pingInterval = false;
      }
    },
  };

  function heartbeat() {
    this.isAlive = true;
  }

  ws.isAlive = true;
  ws.on("pong", heartbeat);

  const process = new ProcessConnection();

  process.on("message", (packet) => {
    send(packet);
  });

  ws.on("message", async (msg) => {
    // console.log("RECV", msg);
    msg = JSON.parse(msg);

    if (msg.type === "subscribe") {
      let locationId = msg.lcoationId;

      process.subscribe(locationId);
    } else {
      let locationId = msg.locationId;

      if (
        typeof msg.type === "string" &&
        typeof msg.locationId === "string" &&
        typeof msg.data === "object"
      ) {
        process.publish(locationId, msg);
      }
    }
  });

  ws.on("error", (e) => {
    console.log("WS Error: ", e);
    wsContext.stopPing();
    process.close();
    ws.terminate();
  });

  ws.on("close", () => {
    wsContext.stopPing();
    process.close();
  });

  wsContext.pingInterval = setInterval(function ping() {
    if (ws.isAlive === false) {
      wsContext.stopPing();
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(noop);
  }, 60e3); // 1 min
});

module.exports = router;

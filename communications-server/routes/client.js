const express = require("express");
const ClientConnection = require("../managers/client-connection");

const router = express.Router();
const noop = () => {};

router.ws("/", (ws, req) => {
  console.log("CLIENT CONNECTION");

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

  const client = new ClientConnection();

  client.on("message", (packet) => {
    send(packet);
  });

  ws.on("message", async (msg) => {
    // console.log("RECV", msg);
    msg = JSON.parse(msg);

    console.log(msg);
  });

  ws.on("error", (e) => {
    console.log("WS Error: ", e);
    wsContext.stopPing();
    client.close();
    ws.terminate();
  });

  ws.on("close", () => {
    console.log("WS Closed");
    wsContext.stopPing();
    client.close();
  });

  wsContext.pingInterval = setInterval(function ping() {
    if (ws.isAlive === false) {
      console.log("TERMINATING WS");
      wsContext.stopPing();
      return ws.terminate();
    }

    console.log("PING WS");

    ws.isAlive = false;
    ws.ping(noop);
  }, 60e3); // 1 min
});

module.exports = router;

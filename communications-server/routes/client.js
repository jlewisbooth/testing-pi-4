const express = require("express");
const ClientConnection = require("../managers/client-connection");

const router = express.Router();

router.ws("/", (ws, req) => {
  console.log("CLIENT CONNECTION");

  function send(packet) {
    console.log("SEND", packet);
    if (typeof packet !== "string") {
      packet = JSON.stringify(packet);
    }

    if (ws.readyState === 1) {
      ws.send(packet);
    }
  }

  send({
    connect: true,
    status: 200,
  });

  const client = new ClientConnection();

  client.on("message", (packet) => {
    send(packet);
  });

  ws.on("message", async (msg) => {
    // console.log("RECV", msg);
    msg = JSON.parse(msg);

    console.log(msg);

    if (msg.type === "subscribe") {
      let locationId = msg.locationId;

      if (!!locationId) {
        client.subscribe(locationId);
      }
    }
  });

  ws.on("error", (e) => {
    console.log("WS Error: ", e);
    client.close();
    ws.terminate();
  });

  ws.on("close", (e) => {
    console.log("WS Closed", e);
    client.close();
  });
});

module.exports = router;

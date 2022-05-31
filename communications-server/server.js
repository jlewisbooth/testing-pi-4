const express = require("express");
const errors = require("@ub/errors");
const { getStateManager } = require("./managers/state-manager");

const UDPServer = require("./managers/udp-server");

let webService = require("./config.json");

const app = express();
require("express-ws")(app);

app.use(function (req, res, next) {
  console.log(req.url);
  next();
});

const serviceName = webService.name;
const port = webService.express.port;

app.use("/client", require("./routes/client"));
app.use("/process", require("./routes/process"));

app.use(errors.NotFoundHandler());
app.use(errors.ErrorHandler());

// start udp server to listen to any datagram packets
let udpServer = new UDPServer();
let stateManager = getStateManager();

if (require.main === module) {
  // running as an independent server
  const callback = () =>
    console.log(`${serviceName}: listening on port ${port}`);
  if (process.env.NODE_ENV == "production") {
    app.listen(port, callback);
  } else {
    app.listen(port, "0.0.0.0", callback);
  }
} else {
  // running as sub-server
  module.exports = app;
}

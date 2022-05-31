const express = require("express");
const errors = require("@ub/errors");
let webService = require("./config.json");

const app = express();
require("express-ws")(app);

const serviceName = webService.name;
const port = webService.express.port;

app.use("/client-stream", require("./routes/client-stream"));
app.use("/data-upload", require("./routes/data-upload"));

app.use(errors.NotFoundHandler());
app.use(errors.ErrorHandler());

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

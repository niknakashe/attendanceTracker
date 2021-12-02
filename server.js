"use strict";
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const multer = require("multer");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./src/config/config");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const userRoutes = require("./src/routes/userRoutes");
const statusRoutes = require("./src/routes/statusRoutes");
const calenderRoutes = require("./src/routes/calenderRoutes");
const leaveRoutes = require("./src/routes/leaveRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");

app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(
  bodyParser.json({
    limit: config.bodyParserLimit,
  })
);
app.disable("etag");
app.use(
  bodyParser.urlencoded({
    limit: config.bodyParserLimit,
    extended: true,
  })
);

app.use(express.static("assets"));
app.use(express.static("/"));

/* SOC: CORS ISSUE */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin,x-access-token,X-Requested-With,authorization,content-type,token,Access-Control-Request-Headers,enctype"
  );

  // Set to true if you need the website to include cookies in  requests
  res.setHeader("Access-Control-Allow-Credentials", "*");
  next();
});
/* EOC */

app.use(function (req, res, next) {
  req.io = io;
  next();
});

app.use("/user", userRoutes);
app.use("/status", statusRoutes);
app.use("/calender", calenderRoutes);
app.use("/leave", leaveRoutes);
app.use("/attendance", attendanceRoutes);

io.on("connection", () => {
  console.log("a user is connected");
});
http.listen(config.port, () => {
  console.log("server is running on port", config.port);
});

module.exports = app;

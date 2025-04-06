var createError = require("http-errors");
var express = require("express");
const cors = require('cors');
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
let { CreateErrorRes } = require("./utils/responseHandler");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// app.listen(3298, () => {});
app.use(cors());

mongoose.connect("mongodb://localhost:27017/S5");
mongoose.connection.on("connected", () => {
  console.log("connected");
});
// view engine setup
// app.set("public", path.join(__dirname, "public"));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/roles", require("./routes/roles"));
app.use("/auth", require("./routes/auth"));
app.use("/products", require("./routes/products"));
app.use("/categories", require("./routes/categories"));
app.use("/brand", require("./routes/brand"));
app.use("/cart", require("./routes/cart"));
app.use("/order", require("./routes/order"));
app.use("/orderDetail", require("./routes/orderDetail"));
app.use("/payment", require("./routes/payment"));
app.use("/orderStatus", require("./routes/orderStatus"));
app.use("/cartDetail", require("./routes/cartDetail"));

// listen port 3200

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("404");
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  CreateErrorRes(res, err.message, err.status || 500);
});

module.exports = app;

var express = require("express");
var router = express.Router();
const orderController = require("../controllers/order");
let { CreateErrorRes, CreateSuccessRes } = require("../utils/responseHandler");

var router = express.Router();
let {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");
let constants = require("../utils/constants");

/* GET users listing. */
router.get("/getAllOrderByUser", check_authentication,
  check_authorization(constants.USER_PERMISSION), async (req, res, next) => {
    try {
      const userId = req.user._id;
      let orders = await orderController.getAllOrderByUserId(userId);
      CreateSuccessRes(res, orders, 200);
    } catch (error) {
      next(error);
    }
  });

// Get detail order by orderId
router.get("/getMyOrderByOrderId/:orderId", check_authentication,
  check_authorization(constants.USER_PERMISSION), async (req, res, next) => {
    try {
      let orderId = req.params.orderId;
      const userId = req.user._id;
      let order = await orderController.getOrderByOrderIdAndUserId(orderId, userId);
      CreateSuccessRes(res, order, 200);
    } catch (error) {
      next(error);
    }
  });
router.get("/getOrderByOrderId/:orderId", check_authentication,
  check_authorization(constants.ADMIN_PERMISSION), async (req, res, next) => {
    try {
      let orderId = req.params.orderId;
      let order = await orderController.getOrderByOrderId(orderId);
      CreateSuccessRes(res, order, 200);
    } catch (error) {
      next(error);
    }
  });

// Create order
router.post(
  "/createOrder",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      let order = req.body;
      order.user = req.user._id;
      let newOrder = await orderController.createOrder(order);
      CreateSuccessRes(res, newOrder, 200);
    } catch (error) {
      next(error);
    }
  }
);


router.put(
  "/updateOrder/:orderId",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      let orderId = req.params.orderId;
      let order = req.body;
      let updateOrder = await orderController.updateOrder(orderId, order);
      CreateSuccessRes(res, updateOrder, 200);
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  "/createOrderFromCart",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      let userId = req.user._id;
      let orderData = req.body;
      let newOrder = await orderController.createOrderFromCart(userId, orderData);
      CreateSuccessRes(res, newOrder, 200);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  "/getAllOrders",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async (req, res, next) => {
    try {
      const date = req.params.date; // Lấy ngày từ query string
      let orders = await orderController.getAllOrders(date);
      CreateSuccessRes(res, orders, 200);
    } catch (error) {
      next(error);
    }
  }
);
router.put(
  "/updateOrderStatus",
  check_authentication,
  check_authorization(constants.MOD_PERMISSION), // Chỉ  có quyền cập nhật trạng thái
  async (req, res, next) => {
    try {
      const orderId = req.query.orderId;
      console.log(orderId);
      // Gọi controller để cập nhật trạng thái đơn hàng
      const updatedOrder = await orderController.updateOrderStatus(orderId);

      CreateSuccessRes(res, updatedOrder, 200);
    } catch (error) {
      next(error);
    }
  }
);
// export the router
module.exports = router;

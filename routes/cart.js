var express = require("express");
var router = express.Router();
let cartController = require("../controllers/cart");
let { CreateSuccessRes } = require("../utils/responseHandler");
let constants = require("../utils/constants");

let {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");
router.get(
  "/",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      const user = req.user;
      let carts = await cartController.getAllCartByUserId(user._id);
      CreateSuccessRes(res, carts, 200);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      const user = req.user;
      let cart = await cartController.createCart({ userId: user._id });
      CreateSuccessRes(res, cart, 200);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      let cart = await cartController.deleteCart(req.params.id);
      CreateSuccessRes(res, cart, 200);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/AutoUpdate/:id",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      let cart = await cartController.autoUpdateCart(req.params.id);
      CreateSuccessRes(res, cart, 200);
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  "/addToCart",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user._id;

      const updatedCart = await cartController.addToCart(userId, productId, quantity);
      CreateSuccessRes(res, updatedCart, 200);
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;

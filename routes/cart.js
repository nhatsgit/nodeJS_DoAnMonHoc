var express = require("express");
var router = express.Router();
let cartController = require("../controllers/cart");
let { CreateSuccessRes } = require("../utils/responseHandler");
let constants = require("../utils/constants");
let productController = require("../controllers/products");

let cartDetailController = require("../controllers/cartDetail");
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
  async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;

      if (!productId || !quantity) {
        return res.status(400).json({
          success: false,
          message: "Product ID and quantity are required.",
        });
      }

      const userId = req.user._id;

      let cart = await cartController.getCartByUserId(userId);
      console.log(cart);
      if (!cart) {
        console.log("create" + cart);


        cart = await cartController.createCart({ userId: userId });
      }

      const product = await productController.getAProduct(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }


      let cartDetail = await cartDetailController.getCartDetailByProductId(
        cart._id,
        productId
      );
      if (cartDetail) {


        cartDetail.quanity += quantity;
        console.log(cartDetail);

        await cartDetailController.updateACartDetail(

          cartDetail._id,
          cartDetail,

        )

      } else {
        await cartDetailController.createACartDetail({
          cart: cart._id,
          product: productId,
          quanity: quantity,
          price: Math.ceil(product.giaBan * (1 - product.phanTramGiam / 100)),
        });
      }

      const updatedCart = await cartController.autoUpdateCart(cart._id);
      CreateSuccessRes(res, updatedCart, 200);
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;

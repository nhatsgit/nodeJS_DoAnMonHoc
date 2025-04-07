var express = require("express");
var router = express.Router();
let cartDetailController = require("../controllers/cartDetail");
let {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");
let constants = require("../utils/constants");
const { CreateSuccessRes } = require("../utils/responseHandler");
let cartController = require("../controllers/cart");

// Get All Cart Detail by CardId
router.get(
  "/GetAllByCartId/:id",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      let cartId = req.params.id;
      let data = await cartDetailController.getAllCartByUserId(cartId);
      CreateSuccessRes(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
);
// create cart detail
router.post(
  "/",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      let data = await cartDetailController.createACartDetail(req.body);
      CreateSuccessRes(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
);

// update cart detail
router.put(
  "/:id",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      let data = await cartDetailController.updateACartDetail(
        req.params.id,
        req.body
      );
      CreateSuccessRes(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
);

// delete cart detail
router.delete(
  "/:id",
  check_authentication,
  check_authorization(constants.USER_PERMISSION),
  async (req, res, next) => {
    try {
      let data = await cartDetailController.deleteACartDetail(req.params.id);
      await cartController.autoUpdateCart(data.cart._id);
      CreateSuccessRes(res, data, 200);
    } catch (error) {
      next(error);
    }
  }
);

// export the router
module.exports = router;
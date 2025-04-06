var express = require("express");
var router = express.Router();
let categoryController = require("../controllers/category");
let { CreateErrorRes, CreateSuccessRes } = require("../utils/responseHandler");
const { uploadAvatarCategory } = require("../utils/upload_file");
let {
  check_authentication,
  check_authorization,
} = require("../utils/check_auth");
let constants = require("../utils/constants");
/* GET users listing. */
router.get(
  "/",
  async function (req, res, next) {
    try {
      let products = await categoryController.getAllCategory();
      CreateSuccessRes(res, products, 200);
    } catch (error) {
      next(error);
    }
  }
);
router.get(
  "/:id",
  check_authorization(constants.USER_PERMISSION),
  async function (req, res, next) {
    try {
      let product = await categoryController.getACategory({
        _id: req.params.id,
        isDeleted: false,
      });
      CreateSuccessRes(res, product, 200);
    } catch (error) {
      next(error);
    }
  }
);
router.post(
  "/",
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  uploadAvatarCategory.single("file"),
  async function (req, res, next) {
    try {
      if (!req.file) {
        throw new Error("k co file");
      } else {
        let category = await categoryController.createACategory({
          name: req.body.name,
          image: "/public/category/" + req.file.filename,
        });
        CreateSuccessRes(res, category, 200);
      }
    } catch (error) {
      next(error);
    }
  }
);
router.put(
  "/:id",
  check_authentication,
  check_authorization(constants.MOD_PERMISSION),
  uploadAvatarCategory.single("file"),
  async function (req, res, next) {
    let id = req.params.id;
    try {
      if (!req.file) {
        throw new Error("k co file");
      } else {
        let category = await categoryController.updateACategory(id, {
          name: req.body.name,
          image: "/public/category/" + req.file.filename,
        });
        CreateSuccessRes(res, category, 200);
      }
      CreateSuccessRes(res, updateProduct, 200);
    } catch (error) {
      next(error);
    }
  }
);
router.delete(
  "/:id",
  check_authentication,
  check_authorization(constants.ADMIN_PERMISSION),
  async function (req, res, next) {
    let id = req.params.id;
    try {
      let updateProduct = await categoryController.deleteACategory(id);
      CreateSuccessRes(res, updateProduct, 200);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

const { toFormData } = require("axios");
let cartDetailModel = require("../schemas/cartDetail");
let cartModel = require("../schemas/cart");
let productController = require("../controllers/products");
let cartDetailController = require("../controllers/cartDetail");

module.exports = {
  getCartByUserId: async (userId) => {
    return await cartModel.findOne({
      user: userId,
      isDeleted: false,
    });
  },
  getAllCartByUserId: async (userId) => {
    try {
      let cart = await cartModel.findOne({
        user: userId,
        isDeleted: false,
      });

      if (!cart) {
        throw new Error("Cart not found.");
      }

      let cartDetails = await cartDetailModel.find({
        cart: cart._id,
        isDeleted: false,
      }).populate({
        path: "product",
        select: "tenSp giaBan anhDaiDien phanTramGiam",
      });

      // Trả về giỏ hàng cùng với chi tiết giỏ hàng
      return {
        ...cart._doc,
        cartDetails,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  createCart: async (cart) => {
    try {
      let createCart = new Date().toUTCString();
      let updateCart = new Date().toUTCString();
      console.log(createCart, updateCart);
      let newCart = new cartModel({
        user: cart.userId,
        createDate: createCart,
        updateDate: updateCart,
        totalPrice: 0,
        totalQuanity: 0,
      });
      return await newCart.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  autoUpdateCart: async (id) => {
    try {
      let cart = await cartModel.findOne({
        _id: id,
        isDeleted: false,
      });
      let cartDetails = await cartDetailModel.find({
        cart: id,
        isDeleted: false,
      });
      let quanity = 0;
      let price = 0;
      for (let index = 0; index < cartDetails.length; index++) {
        quanity += cartDetails[index].quanity;
        price += cartDetails[index].price * cartDetails[index].quanity;
      }
      let updateCart = new Date().toUTCString();
      cart.totalPrice = price;
      cart.totalQuanity = quanity;
      cart.updateDate = updateCart;
      return await cart.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },
  addToCart: async (userId, productId, quantity) => {
    if (!productId || !quantity) {
      throw new Error("Product ID and quantity are required.");
    }

    let cart = await cartModel.findOne({ user: userId, isDeleted: false });

    if (!cart) {
      cart = await cartModel.create({
        user: userId,
        createDate: new Date().toUTCString(),
        updateDate: new Date().toUTCString(),
        totalPrice: 0,
        totalQuanity: 0,
      });
    }

    const product = await productController.getAProduct(productId);
    if (!product) {
      throw new Error("Product not found.");
    }

    let cartDetail = await cartDetailController.getCartDetailByProductId(
      cart._id,
      productId
    );

    if (cartDetail) {
      cartDetail.quanity += quantity;
      await cartDetailController.updateACartDetail(cartDetail._id, cartDetail);
    } else {
      await cartDetailController.createACartDetail({
        cart: cart._id,
        product: productId,
        quanity: quantity,
        price: Math.ceil(product.giaBan * (1 - product.phanTramGiam / 100)),
      });
    }
    const updatedCart = await module.exports.autoUpdateCart(cart._id);
    console.log(updatedCart);
    return updatedCart;
  },
  deleteCart: async (id) => {
    try {
      // soft delete
      return await cartModel.findByIdAndUpdate(id, {
        isDeleted: true,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
  deleteAllCartsByUserId: async (userId) => {
    try {
      // Tìm tất cả các giỏ hàng của người dùng
      let carts = await cartModel.find({
        user: userId,
        isDeleted: false,
      });

      if (!carts || carts.length === 0) {
        throw new Error("No carts found for this user.");
      }

      // Đặt isDeleted = true cho tất cả các cart
      await cartModel.updateMany(
        { user: userId, isDeleted: false },
        { isDeleted: true }
      );

      // Đặt isDeleted = true cho tất cả các cartDetail liên quan
      await cartDetailModel.updateMany(
        { cart: { $in: carts.map((cart) => cart._id) }, isDeleted: false },
        { isDeleted: true }
      );

      return { success: true, message: "All carts and cart details deleted." };
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

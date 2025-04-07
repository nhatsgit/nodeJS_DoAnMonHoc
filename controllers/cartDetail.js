let cartDetailModel = require("../schemas/cartDetail");
module.exports = {
  getAllCartByUserId: async (cartId) => {
    return await cartDetailModel.find({
      cart: cartId,
      isDeleted: false,
    });
  },
  createACartDetail: async (cartDetail) => {
    try {
      let newCartDetail = new cartDetailModel({
        quanity: cartDetail.quanity,
        price: cartDetail.price,
        product: cartDetail.product,
        cart: cartDetail.cart,
      });
      return await newCartDetail.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateACartDetail: async (id, cartDetail) => {
    try {
      return await cartDetailModel.findByIdAndUpdate(id, {
        quanity: cartDetail.quanity,
        price: cartDetail.price,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteACartDetail: async (id) => {
    try {
      return await cartDetailModel.findByIdAndUpdate(id, {
        isDeleted: true,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getCartDetailByProductId: async (cartId, productId) => {
    try {
      return await cartDetailModel.findOne({
        cart: cartId,
        product: productId,
        isDeleted: false,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
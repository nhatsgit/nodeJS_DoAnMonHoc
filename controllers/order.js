let orderModel = require("../schemas/order");
let paymentModel = require("../schemas/payment");
let orderStatusModel = require("../schemas/orderStatus");
let cartDetailModel = require("../schemas/cartDetail");
let cartModel = require("../schemas/cart");
let orderDetailModel = require("../schemas/orderDetail");
module.exports = {
  getAllOrderByUserId: async (userId) => {
    let orders = await orderModel
      .find({
        user: userId,
        isDeleted: false,
      })
      .populate({
        path: "orderDetail",
      });
    return orders;
  },

  getOrderByOrderId: async (orderId) => {
    let order = await orderModel
      .findOne({
        _id: orderId,
        isDeleted: false,
      })
      .populate({
        path: "orderDetail",
      });
    return order;
  },

  createOrder: async (order) => {
    const [payment, orderStatus] = await Promise.all([
      paymentModel.findOne({
        tenLoai: order.payment,
      }),
      brandModel.findOne({ isDeleted: false, tenLoai: body.brand }),
      orderStatusModel.findOne({
        tenTrangThai: order.orderStatus,
      }),
    ]);

    let newOrder = new orderModel();
    newOrder.orderDate = new Date().toUTCString();
    newOrder.totalPrice = 0;
    newOrder.totalQuantity = 0;
    newOrder.shippingAddress = order.shippingAddress;
    newOrder.notes = order.notes;
    newOrder.user = order.user;
    newOrder.payment = payment._id;
    newOrder.orderStatus = orderStatus._id;
    await newOrder.save();

    return newOrder;
  },

  updateOrder: async (orderId, order) => {
    let payment = "";
    let orderStatus = "";
    let
    if (order.payment) {

    }

    let updatedOrder = await orderModel.findOneAndUpdate(
      {
        _id: orderId,
        isDeleted: false,
      },
      order,
      {
        new: true,
      }
    );
    return updatedOrder;
  },

  deleteOrder: async (orderId) => {
    let deletedOrder = await orderModel.findOneAndUpdate(
      {
        _id: orderId,
        isDeleted: false,
      },
      {
        isDeleted: true,
      }
    );
    return deletedOrder;
  },
  createOrderFromCart: async (userId, orderData) => {
    try {
      // Lấy cart của user
      let cart = await cartModel.findOne({
        user: userId,
        isDeleted: false,
      });

      if (!cart) {
        throw new Error("Cart not found for the user.");
      }

      let cartDetails = await cartDetailModel.find({
        cart: cart._id,
        isDeleted: false,
      });

      if (cartDetails.length === 0) {
        throw new Error("Cart is empty.");
      }

      const [payment, orderStatus] = await Promise.all([
        paymentModel.findOne({ tenLoai: orderData.payment }),
        orderStatusModel.findOne({ tenTrangThai: "Chờ xác nhận đơn hàng" }),
      ]);
      console.log(cartDetails);

      if (!payment || !orderStatus) {
        throw new Error("Invalid payment or order status.");
      }

      let newOrder = new orderModel({
        orderDate: new Date().toUTCString(),
        totalPrice: cart.totalPrice,
        totalQuantity: cart.totalQuanity,
        shippingAddress: orderData.shippingAddress,
        notes: orderData.notes,
        user: userId,
        payment: payment._id,
        orderStatus: orderStatus._id,
      });

      await newOrder.save();

      for (let cartDetail of cartDetails) {
        let newOrderDetail = new orderDetailModel({
          quanity: cartDetail.quanity,
          price: cartDetail.price,
          product: cartDetail.product,
          order: newOrder._id,
        });
        await newOrderDetail.save();
      }

      await cartModel.findByIdAndUpdate(cart._id, { isDeleted: true });
      await cartDetailModel.updateMany(
        { cart: cart._id, isDeleted: false },
        { isDeleted: true }
      );

      return newOrder;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

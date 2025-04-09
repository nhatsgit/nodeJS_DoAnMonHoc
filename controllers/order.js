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
      .populate("orderStatus")
      .populate("payment");

    if (!orders || orders.length === 0) {
      throw new Error("No orders found for this user.");
    }

    // Lấy orderDetails cho từng order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        let orderDetails = await orderDetailModel
          .find({
            order: order._id,
            isDeleted: false,
          })
          .populate({
            path: "product",
            select: "tenSp giaBan anhDaiDien", // Chỉ lấy các trường cần thiết từ product
          });

        return {
          ...order._doc, // Thông tin order
          orderDetails,  // Thêm danh sách orderDetails
        };
      })
    );

    return ordersWithDetails;
  },
  getAllOrders: async (date) => {
    try {
      let filter = { isDeleted: false };

      // Nếu có truyền ngày, thêm điều kiện lọc theo ngày
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc của ngày

        filter.orderDate = { $gte: startOfDay.toUTCString(), $lte: endOfDay.toUTCString() };
      }

      // Lấy danh sách đơn hàng
      let orders = await orderModel
        .find(filter)
        .populate("orderStatus")
        .populate("payment")
        .populate({
          path: "user",
          select: "name email", // Chỉ lấy các trường cần thiết từ user
        });

      if (!orders || orders.length === 0) {
        throw new Error("No orders found.");
      }

      // Lấy orderDetails cho từng order
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          let orderDetails = await orderDetailModel
            .find({
              order: order._id,
              isDeleted: false,
            })
            .populate({
              path: "product",
              select: "tenSp giaBan anhDaiDien", // Chỉ lấy các trường cần thiết từ product
            });

          return {
            ...order._doc, // Thông tin order
            orderDetails,  // Thêm danh sách orderDetails
          };
        })
      );

      return ordersWithDetails;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getOrderByOrderIdAndUserId: async (orderId, userId) => {
    let order = await orderModel
      .findOne({
        _id: orderId,
        user: userId,
        isDeleted: false,
      })
      .populate("orderStatus")
      .populate("payment");

    if (!order) {
      throw new Error("Order not found.");
    }

    let orderDetails = await orderDetailModel
      .find({
        order: orderId,
        isDeleted: false,
      })
      .populate({
        path: "product",
        select: "tenSp giaBan anhDaiDien",
      });

    return {
      ...order._doc,
      orderDetails,
    };
  },
  getOrderByOrderId: async (orderId, userId) => {
    let order = await orderModel
      .findOne({
        _id: orderId,
        isDeleted: false,
      })
      .populate("orderStatus")
      .populate("user")
      .populate("payment");

    if (!order) {
      throw new Error("Order not found.");
    }

    let orderDetails = await orderDetailModel
      .find({
        order: orderId,
        isDeleted: false,
      })
      .populate({
        path: "product",
        select: "tenSp giaBan anhDaiDien",
      });

    return {
      ...order._doc,
      orderDetails,
    };
  },
  updateOrderStatus: async (orderId) => {
    try {
      // Lấy thông tin đơn hàng hiện tại
      let order = await orderModel.findOne({
        _id: orderId,
        isDeleted: false,
      });

      if (!order) {
        throw new Error("Order not found.");
      }

      // Lấy danh sách trạng thái đơn hàng
      const orderStatuses = await orderStatusModel.find({ isDeleted: false }).sort({ createdAt: 1 });

      // Tìm trạng thái hiện tại của đơn hàng
      const currentStatusIndex = orderStatuses.findIndex(
        (status) => status._id.toString() === order.orderStatus.toString()
      );

      if (currentStatusIndex === -1) {
        throw new Error("Current order status not found in the list.");
      }

      // Kiểm tra nếu trạng thái hiện tại là trạng thái cuối cùng
      if (currentStatusIndex === orderStatuses.length - 1) {
        throw new Error("Order is already in the final status.");
      }

      // Cập nhật trạng thái đơn hàng sang trạng thái tiếp theo
      const nextStatus = orderStatuses[currentStatusIndex + 1];
      order.orderStatus = nextStatus._id;

      // Lưu lại đơn hàng
      const updatedOrder = await order.save();

      return updatedOrder;
    } catch (error) {
      throw new Error(error.message);
    }
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

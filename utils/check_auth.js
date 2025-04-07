let jwt = require("jsonwebtoken");
let constants = require("../utils/constants");
let userController = require("../controllers/users");

module.exports = {
  check_authentication: async function (req, res, next) {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization;
      if (authorization.startsWith("Bearer")) {
        let token = authorization.split(" ")[1];
        try {
          let result = jwt.verify(token, constants.SECRET_KEY);
          if (result.expire > Date.now()) {
            let user = await userController.getUserByID(result.id);
            req.user = user;
            next();
          } else {
            // Token hết hạn
            return res.status(401).json({
              success: false,
              message: "Token has expired. Please log in again.",
            });
          }
        } catch (error) {
          // Token không hợp lệ
          return res.status(401).json({
            success: false,
            message: "Invalid token. Please log in again.",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Authorization header must start with 'Bearer'.",
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing.",
      });
    }
  },
  check_authorization: function (roles) {
    return async function (req, res, next) {
      try {
        let roleOfUser = req.user.role.name; // Lấy role của người dùng từ req.user
        console.log(roleOfUser);
        if (roles.includes(roleOfUser)) {
          next(); // Người dùng có quyền, tiếp tục xử lý
        } else {
          // Người dùng không có quyền
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this resource.",
          });
        }
      } catch (error) {
        // Xử lý lỗi khác
        return res.status(500).json({
          success: false,
          message: "An error occurred while checking authorization.",
        });
      }
    };
  },
};

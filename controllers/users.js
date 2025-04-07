let userModel = require("../schemas/user");
let roleModel = require("../schemas/role");
let bcrypt = require("bcrypt");
let constants = require("../utils/constants");
let fs = require("fs");
let path = require("path");
const { promiseHooks } = require("v8");
module.exports = {
  getAllUsers: async function () {
    var users = await userModel
      .find({
        status: false,
      })
      .populate({
        path: "role",
        select: ["name"],
      });
    console.log(users);
    return users;
  },
  getUserByID: async function (id) {
    return await userModel
      .findOne({
        _id: id,
        status: false,
      })
      .populate({
        path: "role",
        select: "name",
      });
  },
  GetUserByToken: async function (token) {
    return await userModel
      .findOne({
        resetPasswordToken: token,
      })
      .populate({
        path: "role",
        select: "name",
      });
  },
  GetUserByUsername: async function (username) {
    return await userModel
      .findOne({
        username: username,
        status: false,
      })
      .populate("role");
  },
  CreateAnUser: async function (body) {
    try {
      console.log(body);
      let role = await roleModel.findOne({
        name: body.rolename,
      });
      if (role) {
        let user = new userModel({
          username: body.username,
          passwordHash: bcrypt.hashSync(body.password, constants.HASH),
          email: body.email,
          fullName: body.fullName,
          avatarUrl: "/public/avatar/avatar_default.jpg",
          address: body.address,
          phoneNumber: body.phoneNumber,
          status: false,
          role: role._id,
        });
        return await user.save();
      } else {
        throw new Error("khong tim thay Role User");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },
  UpdateAnUser: async function (id, body) {
    try {
      let user = await userModel.findById(id);
      let allowField = ["email", "fullName", "avatarUrl", "address"];
      for (const key of Object.keys(body)) {
        if (allowField.includes(key)) {
          user[key] = body[key];
        }
      }
      return await user.save();
    } catch (error) {
      throw new Error(error.message);
    }
  },
  DeleteAnUser: async function (id) {
    try {
      return await userModel.findByIdAndUpdate(id, {
        status: false,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },
  CheckLogin: async function (username, password) {
    let user = await this.GetUserByUsername(username);
    if (!user) {
      throw new Error("Username hoac password khong dung");
    } else {

      if (bcrypt.compareSync(password, user.passwordHash)) {
        return user._id;
      } else {
        throw new Error("Username hoac password khong dung");
      }
    }
  },
  ChangePassword: async function (user, oldpassword, newpassword) {
    if (bcrypt.compareSync(oldpassword, user.password)) {
      user.password = newpassword;
      return await user.save();
    } else {
      throw new Error("oldpassword khong dung");
    }
  },
  uploadImage: async function (file, id) {
  }
};

let productModel = require("../schemas/products");
let mongoose = require("mongoose");
let categoryModel = require("../schemas/category");
let brandModel = require("../schemas/brand");
let imageProductModel = require("../schemas/imageProduct");
let userModel = require("../schemas/user");

const { get } = require("mongoose");
const user = require("../schemas/user");

module.exports = {
  getAllProduct: async ({ page, pageSize }) => {
    let products = await productModel
      .find({
        isDeleted: false,
      })
      .populate(["category", "brand", "images"])
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    return products;
  },
  getSearchSuggestions: async (keyword) => {
    try {
      // Tạo điều kiện tìm kiếm
      let query = {
        isDeleted: false,
        tenSp: { $regex: keyword, $options: "i" } // Tìm kiếm không phân biệt hoa thường
      };

      // Truy vấn chỉ lấy tên sản phẩm và giới hạn 5 kết quả
      let suggestions = await productModel
        .find(query, { tenSp: 1, _id: 0 }) // Chỉ lấy trường tenSp, ẩn _id
        .limit(5);

      return suggestions;
    } catch (error) {
      throw error;
    }
  },
  queryProducts: async ({ keyword, categoryId, brandId, minPrice, maxPrice, page, pageSize }) => {
    try {
      // Tạo điều kiện truy vấn
      let query = { isDeleted: false };

      if (keyword) {
        query.tenSp = { $regex: keyword, $options: "i" }; // Tìm kiếm theo tên sản phẩm (không phân biệt hoa thường)
      }

      if (categoryId) {
        query.category = new mongoose.Types.ObjectId(categoryId); // Lọc theo categoryId
      }

      if (brandId) {
        query.brand = new mongoose.Types.ObjectId(brandId); // Lọc theo brandId
      }

      if (minPrice != null) {
        query.giaBan = { ...query.giaBan, $gte: minPrice }; // Lọc giá bán >= minPrice
      }

      if (maxPrice != null) {
        query.giaBan = { ...query.giaBan, $lte: maxPrice }; // Lọc giá bán <= maxPrice
      }

      // Đếm tổng số sản phẩm phù hợp 
      const totalItems = await productModel.countDocuments(query);

      // Tính tổng số trang
      const pageCount = Math.ceil(totalItems / pageSize);

      // Thực hiện truy vấn với phân trang
      let items = await productModel
        .find(query)
        .populate(["category", "brand"]) // Populate category và brand
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      // Trả về kết quả
      return {
        items,
        pageNumber: page,
        pageCount,
      };
    } catch (error) {
      throw error;
    }
  },
  queryProductsDeleted: async ({ keyword, categoryId, brandId, minPrice, maxPrice, page, pageSize }) => {
    try {
      // Tạo điều kiện truy vấn
      let query = { isDeleted: true };

      if (keyword) {
        query.tenSp = { $regex: keyword, $options: "i" }; // Tìm kiếm theo tên sản phẩm (không phân biệt hoa thường)
      }

      if (categoryId) {
        query.category = new mongoose.Types.ObjectId(categoryId); // Lọc theo categoryId
      }

      if (brandId) {
        query.brand = new mongoose.Types.ObjectId(brandId); // Lọc theo brandId
      }

      if (minPrice != null) {
        query.giaBan = { ...query.giaBan, $gte: minPrice }; // Lọc giá bán >= minPrice
      }

      if (maxPrice != null) {
        query.giaBan = { ...query.giaBan, $lte: maxPrice }; // Lọc giá bán <= maxPrice
      }

      // Đếm tổng số sản phẩm phù hợp 
      const totalItems = await productModel.countDocuments(query);

      // Tính tổng số trang
      const pageCount = Math.ceil(totalItems / pageSize);

      // Thực hiện truy vấn với phân trang
      let items = await productModel
        .find(query)
        .populate(["category", "brand"]) // Populate category và brand
        .skip((page - 1) * pageSize)
        .limit(pageSize);

      // Trả về kết quả
      return {
        items,
        pageNumber: page,
        pageCount,
      };
    } catch (error) {
      throw error;
    }
  },
  getAProduct: async (id) => {
    let product = await productModel
      .findById(id)
      .populate(["category", "brand", "images"]);
    return product;
  },

  createProduct: async (body) => {
    try {
      const [brand, category] = await Promise.all([
        brandModel.findOne({ isDeleted: false, tenLoai: body.brand }),
        categoryModel.findOne({ isDeleted: false, tenLoai: body.category }),
      ]);
      let newProduct = new productModel();
      newProduct.tenSp = body.TenSp;
      newProduct.giaBan = parseInt(body.GiaBan, 10);
      newProduct.giaNhap = parseInt(body.GiaNhap, 10);
      newProduct.moTa = body.MoTa;
      newProduct.anhDaiDien = body.anhDaiDien;
      newProduct.soLuongCon = parseInt(body.SoLuongCon, 10);
      newProduct.category = category._id;
      newProduct.brand = brand._id;

      let imageIds = [];
      for (const image of body.images) {
        let imageProduct = new imageProductModel({
          url: image.path,
          productId: newProduct._id,
        });
        await imageProduct.save();
        imageIds.push(imageProduct._id);
      }
      newProduct.images = imageIds;

      return await newProduct.save();
    } catch (error) {
      throw error;
    }
  },

  // update
  updateProduct: async (id, body) => {
    try {
      let product = await productModel.findById(id);
      const [brand, category] = await Promise.all([
        brandModel.findOne({ isDeleted: false, tenLoai: body.brand }),
        categoryModel.findOne({ isDeleted: false, tenLoai: body.category }),
      ]);
      if (body.tenSp != null) {
        product.tenSp = body.tenSp;
      }
      if (body.giaBan != null) {
        product.giaBan = parseInt(body.giaBan, 10);
      }

      if (body.giaNhap != null) {
        product.giaNhap = parseInt(body.giaNhap, 10);
      }

      if (body.moTa != null) {
        product.moTa = body.moTa;
      }

      if (body.soLuongCon != null) {
        product.soLuongCon = parseInt(body.soLuongCon, 10);
      }

      if (body.category != null) {
        product.category = category._id;
      }

      if (body.brand != null) {
        product.brand = brand._id;
      }

      if (body.images != null) {
        let imageIds = [];
        for (const image of body.images) {
          let imageProduct = new imageProductModel({
            url: image.path,
            productId: product._id,
          });
          await imageProduct.save();
          imageIds.push(imageProduct._id);
        }
        product.images = imageIds;
      }
      return await product.save();
    } catch (error) {
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      let product = await productModel.findByIdAndUpdate(id, {
        isDeleted: true,
      });
      return product;
    } catch (error) {
      throw error;
    }
  },
  getRandomProduct: async (quantity) => {
    try {
      let products = await productModel.aggregate([
        { $match: { isDeleted: false } }, // Lọc sản phẩm không bị xóa
        { $sample: { size: quantity } }, // Lấy ngẫu nhiên số lượng sản phẩm
        { $project: { images: 0 } }, // Loại bỏ trường images
      ]);
      return products;
    } catch (error) {
      throw error;
    }
  },
};

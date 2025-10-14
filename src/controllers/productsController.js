import { Product } from '../models/product.js';
import createHttpError from 'http-errors';

export const getProducts = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    name,
    price,
    category,
    search,
    sortBy = 'name',
    sortOrder = 'asc',
  } = req.query;

  const skip = (page - 1) * perPage;

  const productsQuery = Product.find();

  if (search) {
    productsQuery.where({ $text: { $search: search } });
  }

  if (name) {
    productsQuery.where('name').equals(name);
  }
  if (price) {
    productsQuery.where('price').lte(price);
  }
  if (category) {
    productsQuery.where('category').equals(category);
  }

  const [totalItems, products] = await Promise.all([
    productsQuery.clone().countDocuments(),
    await productsQuery
      .skip(skip)
      .limit(perPage)
      .sort({ [sortBy]: sortOrder }),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page,
    perPage,
    totalItems,
    totalPages,
    products,
  });
};

export const getProductById = async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    next(createHttpError(404, 'Product not found'));
  }

  res.status(200).json(product);
};

export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

export const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findOneAndDelete(productId); // or findByIdAndDelete

  if (!product) {
    return next(createHttpError(404, 'Product not found'));
  }

  res.status(200).json(product);
};

export const updateProduct = async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findOneAndUpdate(
    { _id: productId }, // Шукаємо по id
    req.body,
    { new: true }, // повертаємо оновлений документ
  );

  if (!product) {
    next(createHttpError(404, 'Product not found'));
    return;
  }

  res.status(200).json(product);
};

import { Joi, Segments } from 'celebrate';
import { CATEGORY } from '../constants/category.js';

import { isValidObjectId } from 'mongoose';

// Кастомний валідатор для ObjectId
const objectIdValidator = (value, helpers) => {
  return !isValidObjectId(value) ? helpers.message('Invalid id format') : value;
};

export const createProductSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(3).max(40).required().messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name should have at least {#limit} characters',
      'string.max': 'Name should have at most {#limit} characters',
      'any.required': 'Name is required',
    }),
    price: Joi.number().required().messages({
      'number.base': 'Price must be a number',
      'any.required': 'Price is required',
    }),
    category: Joi.string()
      .valid(...CATEGORY)
      .required()
      .messages({
        'any.only':
          'Category must be one of: books, electronics, clothing, other',
        'any.required': 'Category is required',
      }),
    description: Joi.string().messages({
      'string.base': 'Description must be a string',
    }),
  }),
};

// Схема для перевірки параметра Id
export const productIdParamSchema = {
  [Segments.PARAMS]: Joi.object({
    productId: Joi.string().custom(objectIdValidator).required(),
  }),
};

export const updateProductSchema = {
  [Segments.PARAMS]: Joi.object({
    productId: Joi.string().custom(objectIdValidator).required(),
  }),
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(3).max(40).messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name should have at least {#limit} characters',
      'string.max': 'Name should have at most {#limit} characters',
    }),
    price: Joi.number().messages({
      'number.base': 'Price must be a number',
    }),
    category: Joi.string()
      .valid(...CATEGORY)
      .messages({
        'any.only':
          'Category must be one of: books, electronics, clothing, other',
      }),
    description: Joi.string().messages({
      'string.base': 'Description must be a string',
    }),
  }).min(1),
};

export const getAllProductsSchema = {
  [Segments.QUERY]: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(10).default(10),
    name: Joi.string(),
    price: Joi.number(),
    category: Joi.string().valid(...CATEGORY),
    search: Joi.string().trim().allow(''),
    sortBy: Joi.string()
      .valid('_id', 'name', 'price', 'category')
      .default('name'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  }),
};

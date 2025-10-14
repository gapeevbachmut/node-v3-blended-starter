import { Schema, model } from 'mongoose';
import { CATEGORY } from '../constants/category.js';

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: CATEGORY,
      default: 'other',
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index(
  { name: 'text', description: 'text' },

  {
    name: 'ProductTextIndex',
    weights: { name: 10, description: 5 },
    default_language: 'english',
  },
);

export const Product = model('Product', productSchema);

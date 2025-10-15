import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

// Видалення паролю з відповіді
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

//   коли пошта = ім'я
// userSchema.pre('save', function (next) {
//   if (!this.username) {
//     this.username = this.email;
//   }
//   next();
// });

export const User = model('User', userSchema);

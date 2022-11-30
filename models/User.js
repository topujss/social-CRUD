import mongoose from 'mongoose';

// create schema data
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    skill: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    photo: {
      type: String,
      trim: true,
    },
    gallery: {
      type: [String],
      trim: true,
    },
    isActivate: {
      type: Boolean,
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// export
export default mongoose.model('User', userSchema);

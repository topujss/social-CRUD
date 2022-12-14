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
    username: {
      type: String,
      trim: true,
    },
    cell: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
    },
    skill: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    location: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      trim: true,
    },
    gallery: {
      type: [String],
      trim: true,
    },
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
    },
    follower: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
    },
    accessToken: {
      type: String,
      trim: true,
    },
    isActivate: {
      type: Boolean,
      default: false,
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

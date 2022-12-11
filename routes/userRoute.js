import express from 'express';
import multer from 'multer';
import path, { resolve } from 'path';
import {
  loginPage,
  loginUser,
  logoutUser,
  profilePage,
  registerPage,
  registerUser,
  userActivate,
  photoPage,
  passPage,
  editPage,
  photoChange,
  galleryPage,
  galleryChange,
  findFriendPage,
  userProfileData,
  changePassPage,
  followUser,
  unfollowUser,
  forgetPassPage,
  forgetPass,
  resetPassPage,
  resetPassChange,
  editChange,
} from '../controllers/userController.js';
import { authMiddleware as tokenMW } from '../middlewares/authMiddlewares.js';
import { authRedirectMiddlewares as redirectMW } from '../middlewares/authRedirectMiddlewares.js';

// dirname resolve
const __dirname = resolve();

// configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname == 'gallery-p') {
      // gallery photo rest area route
      cb(null, path.join(__dirname, '/public/media/gallery'));
    }
    if (file.fieldname == 'profile-p') {
      // single photo rest area route
      cb(null, path.join(__dirname, '/public/media/users'));
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

// upload multer route area
const profilePhotoUp = multer({ storage }).single('profile-p');
const galleryPhotoUp = multer({ storage }).array('gallery-p', 5);

// router init
const route = express.Router();

// profile route
route.route('/').get(redirectMW, profilePage);

// profile edit route
route.route('/profile-edit').get(redirectMW, editPage).post(editChange);

// register route
route.route('/register').get(tokenMW, registerPage).post(registerUser);

// login and logout route
route.route('/login').get(tokenMW, loginPage).post(loginUser);
route.get('/logout', logoutUser);

// profile photo route
route.route('/photo-up').get(redirectMW, photoPage).post(profilePhotoUp, photoChange);

// gallery photo route
route.route('/gallery-up').get(redirectMW, galleryPage).post(galleryPhotoUp, galleryChange);

// password route
route.route('/pass-change').get(redirectMW, passPage).post(redirectMW, changePassPage);

// forget password route
route.route('/forget-pass').get(tokenMW, forgetPassPage).post(forgetPass);

// reset password route
route.route('/resetpass/:token').get(resetPassPage).post(resetPassChange);

route.get('/activate/:token', userActivate);

// follow and unfollow page route
route.route('/follow/:id').get(redirectMW, followUser);
route.route('/unfollow/:id').get(redirectMW, unfollowUser);

// profile photo route
route.get('/find', redirectMW, findFriendPage);
route.get('/:id', redirectMW, userProfileData);

// export
export default route;

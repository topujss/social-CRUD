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
const galleryPhotoUp = multer({ storage }).array('gallery-p', 3);

// router init
const route = express.Router();

// route mannagement
route.get('/', redirectMW, profilePage);

// profile photo route
route.get('/photo-up', redirectMW, photoPage);
route.post('/photo-up', profilePhotoUp, photoChange);

// gallery photo route
route.get('/gallery-up', redirectMW, galleryPage);
route.post('/gallery-up', galleryPhotoUp, galleryChange);

route.get('/pass-change', redirectMW, passPage);
route.get('/profile-edit', redirectMW, editPage);

route.get('/login', tokenMW, loginPage);
route.get('/register', tokenMW, registerPage);
route.post('/login', loginUser);
route.post('/register', registerUser);
route.get('/logout', logoutUser);
route.get('/activate/:token', userActivate);

// export
export default route;

import express from 'express';
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
} from '../controllers/userController.js';
import { authMiddleware as tokenMW } from '../middlewares/authMiddlewares.js';
import { authRedirectMiddlewares as redirectMW } from '../middlewares/authRedirectMiddlewares.js';

// router init
const route = express.Router();

// route mannagement
route.get('/', redirectMW, profilePage);

route.get('/photo-up', redirectMW, photoPage);
route.get('/pass-change', redirectMW, passPage);

route.get('/login', tokenMW, loginPage);
route.get('/register', tokenMW, registerPage);
route.post('/login', loginUser);
route.post('/register', registerUser);
route.get('/logout', logoutUser);
route.get('/activate/:token', userActivate);

// export
export default route;

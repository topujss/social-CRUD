import express from 'express';
import {
  loginPage,
  loginUser,
  logoutUser,
  profilePage,
  registerPage,
  registerUser,
  userActivate,
} from '../controllers/userController.js';
import { authMiddleware as authMiddle } from '../middlewares/authMiddlewares.js';
import { authRedirectMiddlewares } from '../middlewares/authRedirectMiddlewares.js';

// router init
const route = express.Router();

// route mannagement
route.get('/', authRedirectMiddlewares, profilePage);
route.get('/login', authMiddle, loginPage);
route.get('/register', authMiddle, registerPage);
route.post('/login', loginUser);
route.post('/register', registerUser);
route.get('/logout', logoutUser);
route.get('/activate/:token', userActivate);

// export
export default route;

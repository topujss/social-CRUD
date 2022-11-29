// import packages
import User from '../models/User.js';
import { makeHash } from '../utility/hash.js';
import { validate } from '../utility/validate.js';
import bcrypt from 'bcryptjs';
import { createToken } from '../utility/token.js';

/**
 * view profile Page
 */
export const profilePage = (req, res) => {
  res.render('profile');
};

/**
 * view register Page
 */
export const registerPage = (req, res) => {
  res.render('register');
};

/**
 * view login Page
 */
export const loginPage = (req, res) => {
  res.render('login');
};

/**
 * @post
 * register user
 */
export const registerUser = async (req, res) => {
  try {
    // desture all data
    const { name, email, password } = req.body;

    // form validation
    if (!name || !email || !password) {
      validate('All fields required!', '/register', req, res);
    } else {
      const isEmail = await User.findOne().where('email').equals(email);

      if (isEmail) {
        validate('Email already exist!', '/register', req, res);
      } else {
        // get data from mongodb
        const user = User.create({ name, email, password: makeHash(password) });
        validate('User Registered', '/login', req, res);
      }
    }
  } catch (error) {
    validate(error.message, '/register', req, res);
  }
};

/**
 * @post
 * view login Page
 */
export const loginUser = async (req, res) => {
  try {
    // desture all login data
    const { email, password } = req.body;

    // validate data
    if (!email || !password) {
      validate('All fields required!', '/login', req, res);
    } else {
      const loginUser = await User.findOne().where('email').equals(email);

      if (!loginUser) {
        validate('Email not exist', '/login', req, res);
      } else {
        const userPass = bcrypt.compareSync(password, loginUser.password);

        if (!userPass) {
          validate('Invalid Password', '/login', req, res);
        } else {
          const token = createToken({ id: loginUser._id }, 1000 * 60 * 60 * 24 * 365);
          req.session.user = loginUser;
          res.cookie('userToken', token);
          validate('Login Success', '/', req, res);
        }
      }
    }
  } catch (err) {
    validate(err.message, '/login', req, res);
  }
};

/**
 * logout page
 */
export const logoutUser = (req, res) => {
  delete req.session.user;
  res.clearCookie('userToken');
  validate('Logout Success', '/login', req, res);
};
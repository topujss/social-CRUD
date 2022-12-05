// import packages
import User from '../models/User.js';
import { makeHash } from '../utility/hash.js';
import { validate } from '../utility/validate.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createToken } from '../utility/token.js';
import { activateMail } from '../utility/mail.js';

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

/*******************
 * VIEW LOGIN PAGE *
 *******************/
export const loginPage = (req, res) => {
  res.render('login');
};

/*****************
 *     @POST     *
 * REGISTER USER *
 *****************/
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
        const user = await User.create({ name, email, password: makeHash(password) });

        // make a token which can last 3 days
        const token = createToken({ id: user._id }, 1000 * 60 * 60 * 24 * 3);

        // get activation email url
        const activateLink = `${process.env.APP_URL}:${process.env.PORT}/activate/${token}`;

        // pass email data
        activateMail(email, {
          name,
          link: activateLink,
          email,
        });

        validate('User Registered', '/login', req, res);
      }
    }
  } catch (error) {
    validate(error.message, '/register', req, res);
  }
};

/*****************
 *     @POST     *
 * login USER    *
 *****************/
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
        // check if account is active
        if (!loginUser.isActivate) {
          validate('Please activate!', '/login', req, res);
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

// user activation
export const userActivate = async (req, res) => {
  try {
    // get token
    const { token } = req.params;

    // now verify token using jwt verify
    const verifyToken = jwt.verify(String(token), process.env.JWT_TOKEN);

    // * when token isn't verify
    if (!verifyToken) {
      validate('Invalid activation link', '/login', req, res);
    } else {
      const activateUser = await User.findOne({ _id: verifyToken.id });

      // when isActivate is true
      if (activateUser.isActivate) {
        validate('Account activated', '/login', req, res);
      } else {
        // when not activated
        await User.findByIdAndUpdate(verifyToken.id, {
          isActivate: true,
        });
        validate('Account activation success, Please login', '/login', req, res);
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

/**
 * Profile photo update
 * - will update the single profile photo
 */
export const photoPage = async (req, res) => {
  res.render('photo');
};

export const photoChange = async (req, res) => {
  try {
    // update photo data by getting the id from session
    await User.findByIdAndUpdate(req.session.user._id, {
      photo: req.file.filename,
    });
    // get the photo from session and pass the photo name
    req.session.user.photo = req.file.filename;
    validate('Photo uploaded', '/photo-up', req, res);
  } catch (error) {
    validate(error.message, '/login', req, res);
  }
};

/**
 * gallery photo update
 * - will update multiple profile photo
 */
export const galleryPage = async (req, res) => {
  res.render('gallery');
};

export const galleryChange = async (req, res) => {
  try {
    // do a loop to get certain one
    for (let i = 0; i < req.files.length; i++) {
      // update photo data by getting the id from session
      await User.findByIdAndUpdate(req.session.user._id, {
        $push: {
          gallery: req.files[i].filename,
        },
      });
    }

    validate('gallery photo uploaded', '/gallery-up', req, res);
  } catch (error) {
    validate(error.message, '/gallery-up', req, res);
  }
};

/**
 * Profile password change
 * - will change the password of an user
 */
export const passPage = async (req, res) => {
  res.render('pass');
};

/**
 * Profile edit page
 * - user can edit there information from name to gender
 */
export const editPage = async (req, res) => {
  res.render('edit');
};

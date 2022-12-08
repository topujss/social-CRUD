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
    let isFile = [];

    // do a loop to get certain one
    req.files.forEach((item) => {
      isFile.push(item.filename);
      req.session.user.gallery.push(item.filename);
    });

    // update photo data by getting the id from session
    await User.findByIdAndUpdate(req.session.user._id, {
      $push: {
        gallery: { $each: isFile },
      },
    });

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
 * Profile password change
 * - will change the password of an user
 */
export const changePassPage = async (req, res) => {
  try {
    // get pass from form data
    const { oldPass, newPass, confirmPass } = req.body;

    // validate data
    if (!oldPass || !newPass || !confirmPass) {
      validate('All fields are required!', '/pass-change', req, res);
    } else {
      // get pass from session
      const loggedPass = req.session.user.password;

      // compare old pass with login pass
      const passCheck = bcrypt.compareSync(oldPass, loggedPass);

      // when both password !match
      if (!passCheck) {
        validate('Password not match', '/pass-change', req, res);
      } else {
        // when both newPass and confirmPass !match
        if (newPass != confirmPass) {
          validate(`Either password isn't match`, '/pass-login', req, res);
        } else {
          await User.findByIdAndUpdate(req.session.user._id, {
            password: makeHash(newPass),
          });
          res.clearCookie('userToken');
          validate('password change success', '/login', req, res);
        }
      }
    }
  } catch (error) {
    validate('Password not correct', '/login', req, res);
  }
};

/**
 * Profile edit page
 * - user can edit there information from name to gender
 */
export const editPage = async (req, res) => {
  res.render('edit');
};

/**
 * find friends page
 * - user can find there friends in this route
 */
export const findFriendPage = async (req, res) => {
  try {
    const friendData = await User.find().where('email').ne(req.session.user.email);

    res.render('friends', { friendData });
  } catch (error) {
    console.log(error.message);
  }
};

/**
 * user profile page
 * - user can go to there friends profile in this route
 */
export const userProfileData = async (req, res) => {
  try {
    const { id } = req.params;

    const show = await User.findById(id);

    res.render('single', { show });
  } catch (error) {
    console.log(error.message);
  }
};

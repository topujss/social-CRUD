// import packages
import User from '../models/User.js';
import { makeHash } from '../utility/hash.js';
import { validate } from '../utility/validate.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createToken } from '../utility/token.js';
import { activateMail } from '../utility/mail.js';

/**
 *  @desc profile page show
 *  @name get
 *  @access private
 **/
export const profilePage = (req, res) => {
  res.render('profile');
};

/**
 *  @desc register page for user
 *  @name get
 *  @access public
 **/
export const registerPage = (req, res) => {
  res.render('register');
};

/**
 *  @desc login page for user
 *  @name get
 *  @access public
 **/
export const loginPage = (req, res) => {
  res.render('login');
};

/**
 *  @desc fetch register data user
 *  @name post
 *  @access private
 **/
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

/**
 *  @desc fetch login data user
 *  @name post
 *  @access private
 **/
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
 *  @desc logout for user
 *  @name get
 *  @access private
 **/
export const logoutUser = (req, res) => {
  delete req.session.user;
  res.clearCookie('userToken');
  validate('Logout Success', '/login', req, res);
};

/**
 *  @desc activate an user
 *  @name post
 *  @access public
 **/
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
 *  @title Profile photo update
 *  @desc will update the single profile photo
 *  @name get
 *  @access public
 **/
export const photoPage = async (req, res) => {
  res.render('photo');
};

/**
 *  @desc change photo user
 *  @name post
 *  @access private
 **/
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
 *  @title gallery photo update
 *  @desc user can upload multiple profile photo
 *  @name post
 *  @access private
 **/
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
 *  @desc Profile password page
 *  @name get
 *  @access private
 **/
export const passPage = async (req, res) => {
  res.render('pass');
};

/**
 *  @title Profile password change
 *  @desc user can change the password
 *  @name post
 *  @access private
 **/
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
 *  @title forget pass email page
 *  @desc user can send there email
 *  @name get
 *  @access public
 **/
export const forgetPassPage = async (req, res) => {
  res.render('forgetpassemail');
};

/**
 *  @title reset pass page
 *  @desc user can reset there password
 *  @name get
 *  @access public
 **/
export const resetPassPage = (req, res) => {
  const { token } = req.params;

  res.render('resetpass', {
    token,
  });
};

/**
 *  @title reset pass change
 *  @desc user can reset there password in backend
 *  @name post
 *  @access private
 **/
export const resetPassChange = async (req, res) => {
  try {
    const { token } = req.params;
    const tokenIn = jwt.verify(token, process.env.JWT_TOKEN);

    if (!tokenIn) {
      validate('Token not valid', `/resetpass/${token}`, req, res);
    } else {
      const { newPass, confirmPass } = req.body;

      if (!newPass || !confirmPass) {
        validate('Fields can not be empty', `/resetpass/${token}`, req, res);
      } else {
        if (newPass != confirmPass) {
          validate('password not match', `/resetpass/${token}`, req, res);
        } else {
          await User.findByIdAndUpdate(
            { _id: tokenIn.id },
            {
              password: makeHash(newPass),
            }
          );
          validate('Pass successfully reset', '/login', req, res);
        }
      }
    }
  } catch (error) {
    validate(error.message, '/forget-pass', req, res);
  }
};

/**
 *  @title forget pass post get email
 *  @desc user can change there password by confirming from email
 *  @name post
 *  @access public
 **/
export const forgetPass = async (req, res) => {
  try {
    const { email } = req.body;

    const forgetpassemail = await User.findOne().where('email').equals(email);

    if (!forgetpassemail) {
      validate('Email not found on our end', '/forget-pass', req, res);
    } else {
      // make a token which can last 3 days
      const token = createToken({ id: forgetpassemail._id }, 1000 * 60 * 60 * 24 * 3);

      // get activation email url
      const activateLink = `${process.env.APP_URL}:${process.env.PORT}/resetpass/${token}`;

      await activateMail(email, {
        name: forgetpassemail.name,
        link: activateLink,
      });
      validate('Email Send success', '/forget-pass', req, res);
    }
  } catch (error) {
    validate(error.message, '/forget-pass', req, res);
  }
};

/**
 *  @title Profile edit page
 *  @desc user can edit there information from name to gender
 *  @name get
 *  @access private
 **/
export const editPage = async (req, res) => {
  res.render('edit');
};

/**
 *  @title Profile edit data
 *  @desc user can edit there information from name to gender
 *  @name get
 *  @access private
 **/
export const editChange = async (req, res) => {
  try {
    // get form data
    const { name, username, location, cell, gender } = req.body;

    // validation
    if (!name || !username || !cell || !location || !gender) {
      validate('All fields required!', '/profile-edit', req, res);
    } else {
      // pass data to database
      const userData = await User.findByIdAndUpdate(req.session.user._id, {
        name,
        location,
        username,
        cell,
        gender,
      });

      req.session.user = userData;

      // send data to session
      validate('Updated successfully', '/logout', req, res);
    }
  } catch (error) {
    validate(error.message, '/profile-edit', req, res);
  }
};

/**
 *  @title find friends page
 *  @desc user can find there friends in this route
 *  @name get
 *  @access private
 **/
export const findFriendPage = async (req, res) => {
  try {
    const friendData = await User.find().where('email').ne(req.session.user.email);

    res.render('friends', { friendData });
  } catch (error) {
    console.log(error.message);
  }
};

/**
 *  @title user profile page
 *  @desc user can go to there friends profile in this route
 *  @name get
 *  @access private
 **/
export const userProfileData = async (req, res) => {
  try {
    const { id } = req.params;

    const show = await User.findById(id);

    res.render('single', { show });
  } catch (error) {
    console.log(error.message);
  }
};

/**
 *  @title follow user page
 *  @desc user can go to friends route and follow friends
 *  @name post
 *  @access private
 **/
export const followUser = async (req, res) => {
  try {
    const { id } = req.params;

    const followId = await User.findByIdAndUpdate(req.session.user._id, {
      $push: {
        following: id,
      },
    });
    await User.findByIdAndUpdate(id, {
      $push: {
        follower: req.session.user._id,
      },
    });
    req.session.user.following.push(id);
    validate('Follows updated', '/find', req, res);
  } catch (error) {
    console.log(error.message);
  }
};

/**
 *  @title unfollow user page
 *  @desc user can go to friends route and unfollow friends
 *  @name post
 *  @access private
 **/
export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const followId = await User.findByIdAndUpdate(req.session.user._id, {
      $pull: {
        following: id,
      },
    });
    await User.findByIdAndUpdate(id, {
      $pull: {
        follower: req.session.user._id,
      },
    });
    let updatedData = req.session.user.following.filter((data) => data != id);
    req.session.user.following = updatedData;

    validate('Follows updated', '/find', req, res);
  } catch (error) {
    console.log(error.message);
  }
};

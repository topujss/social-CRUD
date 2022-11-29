import jwt from 'jsonwebtoken';
import { validate } from '../utility/validate.js';

/**
 * Auth redirect
 */
export const authRedirectMiddlewares = async (req, res, next) => {
  try {
    const token = req.cookies.userToken;

    // validate token
    if (token) {
      const checkToken = jwt.verify(token, process.env.JWT_TOKEN);

      // check if there is any token exist
      if (checkToken) {
        // get user id
        const userId = await User.findById(checkToken.id);

        if (userId) {
          next();
        } else {
          delete req.session.user;
          res.clearCookie('userToken');
          validate('Token user Not found', '/login', req, res);
        }
      }
    } else {
      delete req.session.user;
      res.clearCookie('userToken');
      validate(`You aren't authorized`, '/login', req, res);
    }
  } catch (error) {
    delete req.session.user;
    res.clearCookie('userToken');
    validate('invalid token', '/login', req, res);
  }
};

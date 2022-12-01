import { validate } from '../utility/validate.js';

/*************************************************************
 *                      AUTH MIDDLEWARE                      *
 * - WHEN LOGGED IN YOU CAN'T ACCESS LOGIN AND REGISTER PAGE *
 *************************************************************/

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.userToken;

  if (token) {
    validate('You already logged in!', '/', req, res);
  } else {
    next();
  }
};

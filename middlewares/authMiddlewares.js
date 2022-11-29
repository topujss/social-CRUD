import { validate } from '../utility/validate.js';

/**
 * Auth middleware
 * - when logged in you can't access login and register page
 */
export const authMiddleware = (req, res, next) => {
  const token = req.cookies.userToken;

  if (token) {
    validate('You already logged in!', '/', req, res);
  } else {
    next();
  }
};

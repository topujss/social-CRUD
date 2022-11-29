import jwt from 'jsonwebtoken';

/**
 * create token
 */
export const createToken = (data, exp = 86400000) => {
  const token = jwt.sign(data, process.env.JWT_TOKEN, {
    expiresIn: exp,
  });

  return token;
};

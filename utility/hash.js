import bcryptjs from 'bcryptjs';

export const makeHash = (password) => {
  const salt = bcryptjs.genSaltSync(10)
  const hash = bcryptjs.hashSync(password, salt)
  return hash
};

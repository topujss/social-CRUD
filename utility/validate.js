/**
 * validation message
 */
export const validate = (msg, redirect, req, res) => {
  req.session.message = msg;
  res.redirect(redirect);
};

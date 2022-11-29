/**
 * locals middlewares
 */
export const localsMiddlewares = (req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  res.locals.user = req.session.user;
  next();
};

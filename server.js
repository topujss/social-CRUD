/** social project
 * todo video : https://youtu.be/JZbus-sLfBA 1:20:24 / 2:12:45 < start from here
 * * Learned: activation login, password page, change info page, multer config, photo page,
 * ! Note start:
 * .js /> in es6 when you import always have to use .js at the end
 */
// init needy
import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import session from 'express-session';
import expLyts from 'express-ejs-layouts';
import { mongodbConnect } from './config/db.js';
import { localsMiddlewares } from './middlewares/localsMiddlewares.js';
import userRoute from './routes/userRoute.js';
import cookieParser from 'cookie-parser';

// ENV INIT
dotenv.config();
const PORT = process.env.PORT || 5000;

// express init
const app = express();

// init session
app.use(
  session({
    secret: 'mern is my heartbeat',
    saveUninitialized: true,
    resave: false,
  })
);

// middlewares
app.use(localsMiddlewares);
app.use(cookieParser());

// express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ejs temp init
app.set('view engine', 'ejs');
app.use(expLyts);
app.set('layout', 'layouts/app');

// static folder
app.use(express.static('public'));

// route
app.use('/', userRoute);

// server
app.listen(PORT, () => {
  mongodbConnect();
  console.log(`Express is running ${PORT}`.bgMagenta);
});

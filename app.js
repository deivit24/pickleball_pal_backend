const express = require('express');
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

const morgan = require('morgan');
app.use(morgan('tiny'));

//INIT ROUTES
const usersRoutes = require('./routes/api/users');
const postsRoutes = require('./routes/api/posts');
const profileRoutes = require('./routes/api/profile');
const authRoutes = require('./routes/api/auth');

app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
/** 404 handler */

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function (err, req, res, next) {
  if (err.stack) console.log(err.stack);

  res.status(err.status || 500);

  return res.json({
    error: err,
    msg: err.msg,
  });
});

module.exports = app;

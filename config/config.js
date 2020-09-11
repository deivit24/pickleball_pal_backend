/** Shared config for application; can be req'd many places. */

const SECRET = process.env.SECRET_KEY || 'test';
const db = process.env.MONGO_URI;
const PORT = +process.env.PORT || 3001;

module.exports = {
  SECRET,
  PORT,
  db,
};

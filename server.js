require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/config');

//Connect Database
connectDB();

app.listen(PORT, () => {
  console.log(`Server starting on port ${PORT}!`);
});

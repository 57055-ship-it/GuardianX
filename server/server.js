require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect Database and Start Server
connectDB().then(() => {
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`[GuardianX Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });
  }
});

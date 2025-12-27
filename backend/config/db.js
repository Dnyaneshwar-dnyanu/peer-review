const mongoose = require('mongoose')

let connectDB = async () => {
     try {
          await mongoose.connect(process.env.MONGO_URL);
     }
     catch (err) {
          console.error(err);
          process.exit(1);
     }
}

module.exports = connectDB;
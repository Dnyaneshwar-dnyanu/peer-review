const mongoose = require('mongoose')

let connectDB = async () => {
     try {
          await mongoose.connect(process.env.MONGO_URL);
          console.log("Mongoose Connected");
     }
     catch (err) {
          console.error(err);
          process.exit(1);
     }
}

module.exports = connectDB;
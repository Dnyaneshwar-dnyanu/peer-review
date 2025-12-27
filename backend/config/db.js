const mongoose = require('mongoose');

let connectDB = async () => {
     try {
          console.log("Trying to connect to DB");
          await mongoose.connect(process.env.MONGO_URL);
          console.log("Mongodb connected");
          
     }
     catch (err) {
          console.error(err);
          process.exit(1);
     }
}

module.exports = connectDB;
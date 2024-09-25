const mongoose = require('mongoose')

//connect to the DB
const connectDb = async () => {

       const conn = await mongoose.connect(process.env.MONGO_URL, {
           useNewUrlParser:true,
           useCreateIndex: true,
           useUnifiedTopology: true
       })
       console.log(`MongoDb connected... ${conn.connection.host}`.brightMagenta)

}

module.exports = connectDb
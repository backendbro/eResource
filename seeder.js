const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

//Load ENV VARS
dotenv.config({path: "./config/config.env"})

//Load our module
const Shelf = require('./models/shelf')
const Materials = require('./models/materials')
const User = require('./models/User')



//Connect to Db
mongoose.connect(process.env.MongoURL, {
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:true,
    useUnifiedTopology:true
})



//Import into DB
const importData = async () => {
    try{
       //await Shelf.create(shelf)
        console.log(`Data Imported...`.green.inverse)
        process.exit()
    }catch(err){
        console.error(err)
    }
}


//Destroy Data
const DestroyData = async () => {
    try{
        await Shelf.deleteMany()
        await Materials.deleteMany()
        //await User.deleteMany()
        
        console.log(`Data Destroyed..`.red.inverse)
    process.exit()
}
    
    catch(err){
        console.error(err)
    }
}



if(process.argv[2] === '-i'){
    importData()
}else  if(process.argv[2] === '-d'){
    DestroyData()
}

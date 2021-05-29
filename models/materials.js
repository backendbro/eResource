const mongoose = require('mongoose')


//material schema
const MaterialSchema = new mongoose.Schema({
    name:{
        type:String,
        trim: true,
        required:[true, 'Please add a course title']
    },
    description:{
        type:String,
        required:[true, 'Please add a description']
    },
    file: {
        type: String,
        
      },
    createdAt:{
        type:Date,
        default:Date.now
    },
    shelf:{
        type:mongoose.Schema.ObjectId,
        ref: 'Shelf',
        required:true
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    }
})

module.exports = mongoose.model('Material', MaterialSchema)
const ErrorResponse = require('../ultis/ErrorResponse')

const errorHandler = (err, req, res, next) => {   
let error = { ...err }

error.message = err.message
error.name = err.name 
    //Log to console for dev
    console.log(err.stack.red) 

    //Mongoose bad ObjectId
    if(error.name === 'CastError'){
        const message = `Resource not found with id: ${err.value}` 
         error = new ErrorResponse(message, 404)
        //return res.status(400).json({success:false, data:message}) => They do the same thing
    }

    //Mongoose Duplicate Key
    if(err.code === 11000){
        const message = `Duplicate Field Value Entered`
        error = new ErrorResponse(message, 400)
    }   

    //Mongoose Validation Error
     if(err.name === 'ValidationError'){
         const message = err.message
          error = new ErrorResponse(message, 400)
     }

    
    //Send Error Message To Json
    res.status(error.statusCode || 500).json({success:false, error:error.message || 'Server Error'})
}
module.exports = errorHandler


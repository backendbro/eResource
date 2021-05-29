const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const ErrorResponse = require('../ultis/ErrorResponse')
const User = require('../models/User')


//protect routes
exports.protect = asyncHandler ( async (req, res, next) => {
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.token){
        token = req.cookies.token
    }

    if(!token){
        return next( new ErrorResponse(`Invalid token`, 401))
    }

    //verify token
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id)
        next()
    }catch(err){
        return next( new ErrorResponse(`You must be logged to complete this action`, 401))
    }
})

//authorize users
exports.authorize = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next( new ErrorResponse(`User role: ${req.user.role} is not authorized to access this route`, 403))  
        }
        next()
    }
}

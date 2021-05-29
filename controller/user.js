const ErrorResponse = require('../ultis/ErrorResponse')
const asyncHandler = require('express-async-handler')
const User = require('../models/User')


//@desc    GET ALL USERS
//@@route  GET /api/v1//users
//@@access PRIVATE
exports.getUsers = asyncHandler( async (req, res, next) => {
    const user = await User.find()
    res.status(200).json({ success:true, count: user.length, data: user})
})

//@desc    GET SINGLE USER
//@@route  GET /api/v1/users/:id
//@@access PRIVATE/ADMIN
exports.getUser = asyncHandler( async(req, res, next) => {
    const user = await User.findById(req.params.id)
    if(!user){
        return next( new ErrorResponse(`User not found with ID: ${req.user.id}`, 401))
    }
    res.status(200).json({ success:true, data: user})
})

//@desc    Create USER
//@@route  POST /api/v1/user
//@@access PRIVATE/ADMIN
exports.createUser = asyncHandler ( async ( req, res, next) => {
    const user = await User.create(req.body)
    res.status(200).json({ success:true, data: user})
})

//@desc    Update USER
//@@route  PUT /api/v1/users/:id
//@@access PRIVATE/ADMIN

exports.updateUser = asyncHandler ( async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true
    })

    res.status(200).json({ success:true, data: user})
})


//@desc    DELETE USER
//@@route  DELETE /api/v1/users/:id
//@@access PRIVATE/ADMIN

exports.deleteUser = asyncHandler ( async ( req, res, next) => {
    const user = await User.findById(req.params.id)
    if(!user){
        return next( new ErrorResponse(`No user found with ID: ${req.user.id}`, 404))
    }
    await user.remove()
    res.status(200).json({ success:true, data: {}})
})

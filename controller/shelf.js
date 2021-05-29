const asyncHandler = require('express-async-handler')
const Shelf = require('../models/shelf')
const ErrorResponse = require('../ultis/ErrorResponse')

//@desc    Get All Shelfs
//@@route  GET /api/v1/shelf
//@@access PUBLIC

exports.getShelfs = asyncHandler ( async (req, res, next) => {
    const shelf = await Shelf.find().populate('material')
    if(!shelf){
        return next(new ErrorResponse(`No shelf found.`, 401))
    }
    res.status(200).json({ success:true, count: shelf.length, data: shelf})
})

//@desc    Get  Single Shelf
//@@route  GET /api/v1/shelf/:id
//@@access PUBLIC
exports.getShelf = asyncHandler( async ( req, res, next) => {
    const shelf = await Shelf.findById(req.params.id).populate('material')
    if(!shelf){
        return next( new ErrorResponse(`Shelf not found with ID: ${req.params.id}`, 404))
    }
    res.status(200).json({ success:true, data: shelf})
})  


//@desc    Create Shelf
//@@route  POST /api/v1/shelf/
//@@access Private

exports.createShelf = asyncHandler ( async ( req, res, next) => {
   
    //pass in the user to the shelf model
    req.body.user = req.user.id

    //check if user has initially uploaded a bootcamp
    const publishedShelf = await Shelf.findOne({ user: req.user.id})
    
    
    //check if user is an admin or publisher
    if(publishedShelf && req.user.role !== 'admin'){
        return next( new ErrorResponse( `User with USER ID: ${req.user.id} has already uploaded a shelf`, 404))
    }
    
    const shelf = await Shelf.create(req.body)
    res.status(201).json({ success: true, data: shelf})
})

//@desc    Update Shelf
//@@route  PUT /api/v1/shelf/:id
//@@access Private

exports.updateShelf = asyncHandler ( async ( req, res, next) => {
    let shelf = await Shelf.findById(req.params.id)
    if(!shelf){
        return next( new ErrorResponse(`No Shelf found with ID: ${req.params.id}`, 404))
    }

    //check if the user is authorize to complete action
    if(shelf.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User with USER ID: ${req.user.id} is not authorized to complete this action`, 404))
    }

    shelf = await Shelf.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators: true
    })

    res.status(200).json({ success:true, data: shelf})
})

//@desc    Delete Shelf
//@@route  PUT /api/v1/shelf/:id
//@@access Private
exports.deleteShelf = asyncHandler ( async ( req, res, next) => {
    const shelf = await Shelf.findById(req.params.id)
    
    if(!shelf){
        return next( new ErrorResponse(`No shelf found with ID: ${req.params.id}`, 404))
    }

        //check for ownership
        if(shelf.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return next( new ErrorResponse(`User with USER ID: ${req.user.id} is not authorized to complete this action`, 404))
        }

    await Shelf.remove()
    res.status(200).json({ success:true, data: {}})

})


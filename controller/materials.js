const ErrorResponse = require('../ultis/ErrorResponse')
const asyncHandler = require('express-async-handler')
const Material = require('../models/materials')
const Shelf = require('../models/shelf');
const path = require('path')
const fs = require('fs')
const os = require('os')
const https = require('https')


    
const { upload } = require('uploadthing/server'); 


//@desc     Get materials
//@@route   GET /api/v1/materials
//@@route  GET /api/v1/:shelfId/material
//@@access PUBLIC
exports.getMaterials = asyncHandler ( async (req, res, next) => {
        
    //check if user is accessing a material through shelfId  
    if(req.params.shelfId){
            const material = await Material.find({ shelf: req.params.shelfId}).populate({
                path:'shelf',
                select: 'name description email'
            })
            res.status(200).json({ success: true, data: material})
        }
        else{
            const material = await Material.find().populate({
                path:'shelf',
                select: 'name description email'
            })
            res.status(200).json({ success: true, data: material})   
        }
        
})


//@desc     Get Single materials
//@@route   GET /api/v1/materials/:id
//@@access PUBLIC
exports.getMaterial = asyncHandler ( async ( req, res, next) => {
    const material = await Material.findById(req.params.id).populate({
        path:'shelf',
        select: 'name description email'
    })
    if(!material){
        return next (new ErrorResponse (`No material found with this ID: ${req.params.id}`))
    }
    res.status(200).json({ success: true, data: material})
})


//@desc     Create materials
//@@route  POST /api/v1/:materialId/material
//@@access PUBLIC
exports.createMaterial = asyncHandler ( async ( req, res, next) => {
    req.body.shelf = req.params.shelfId
    req.body.user = req.user.id

    const shelf = await Shelf.findById(req.params.shelfId)
    if(!shelf){
        return next( new ErrorResponse(`No shelf found with the ID: ${req.params.shelfId}`))
    }

    //check if user is allowed to complete this action
    if(shelf.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User with USER ID: ${req.user.id} is not allowed to complete this action`, 404))
    }

    const material = await Material.create(req.body)
    res.status(200).json({ success:true, data: material })
})



//@desc    Update course
//@@route   PUT /api/v1/material/:id
//@@access PRIVATE
exports.updateMaterial = asyncHandler ( async ( req, res, next) => {
    let material = await Material.findById(req.params.id)
    if(!material){
        return next(new ErrorResponse(`No material found with this ID: ${req.params.id}`))
    }
    //MAKE SURE USER IS COURSE OWNER
    if(material.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User: ${req.user.id} not authorized to complete this action`, 404))
    }

    material = await Material.findOneAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true
    })

    res.status(200).json({ success:true, data: material})
})

//@desc    DELETE course
//@@route   DELETE /api/v1/material/:id
//@@access PRIVATE
exports.deleteMaterial = asyncHandler ( async ( req, res, next) => {
    let material = await Material.findById(req.params.id)
    if(!material){
        return next(new ErrorResponse(`No material found with this ID: ${req.params.id}`))
    }

    //MAKE SURE USER IS COURSE OWNER
    if(material.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User: ${req.user.id} not authorized to complete this action`, 404))
    }    

    await material.delete()
    res.status(200).json({ success: true, data: { }})
})


//@desc    Upload file
//@@route   Put /api/v1/material/:id/fileupload
//@@access PRIVATE
exports.fileUpload = asyncHandler ( async  ( req, res, next) => {


    let material = await Material.findById(req.params.id)


    if(!material){
        return next( new ErrorResponse(`No material found with this ID: ${req.params.id}`))
    }

    //check the ownership of the course
    if(material.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User: ${req.user.id} not authorized to complete this action`, 404))
    }


    //check if upload is a file
    if(!req.files) {
        return next( new ErrorResponse(`Please upload a file`, 404))
    }


    const file = req.files.file 

    //check for file size
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next ( new ErrorResponse(`File too large. File must not be bigger than ${process.env.MAX_FILE_UPLOAD}`, 404))
    }

  
    file.name = `file_${material._id}${path.parse(file.name).ext}`


    const os_user = os.userInfo().username;
    const FILE_UPLOAD_PATH = `C:\\Users\\${os_user}\\Downloads`;


    //upload file 
    file.mv(`${FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            return next(new ErrorResponse(`Something went wrong`, 400))
        }

        await Material.findByIdAndUpdate(req.params.id, {file: file.name})
        res.status(200).json({ success: true, file: file.name})
    })
})


//@desc    Download file
//@@route   Put /api/v1/material/download/:filename
//@@access PRIVATE
exports.downloadFile = asyncHandler ( async ( req, res, next) => {
    

    const checkFile = await Material.findOne({filename:req.params.id})
    
    if(!checkFile || checkFile.length === 0){
        return next( new ErrorResponse(`File with ID: ${req.params.id} does not exist`, 401))
    }   
    
//    const url = `https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg`
    const hostedUrl = `https://${req.get('host')}/api/v1/material/download/${req.params.filename}`
    
    //use hostedUrl only when your app has been hosted. if not it will return an error
    


    //CREATE CUSTOM FILENAME
    fileName = `file_${checkFile._id}${path.parse(url).ext}`
    
    let file = fs.createWriteStream(`${os.homedir()}` + '\\' + 'Downloads' + '\\'+ `${fileName}`)
    const filePath = `${os.homedir()}` + '\\' + 'Downloads' + '\\'+ `${fileName}`
    
    https.get(url, function(response){
        response.pipe(file)
        file.on('finish', function(){
            file.close( () => console.log(`${fileName} downloaded..`))
            res.status(200).json({ success:true, path: filePath, data: `${fileName} downloaded..`})
            
        })
    }) 
})


//@desc    Get file
//@@route   Get /api/v1/material/materialId/:filename
//@@access PRIVATE
exports.getFile = asyncHandler ( async ( req, res,next) => {

    const material = await Material.findOne({_id:req.params.materialId})

    const file = await Material.findOne({ file: req.params.filename})
    if(!file){
        return next( new ErrorResponse( `File with ID: ${req.params.filename} does not exists`, 403))
    }

    res.status(200).json({ success:true, data: file.file})
})


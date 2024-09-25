const express = require('express')
const router = express.Router({mergeParams:true})
const {
    getMaterial,
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    fileUpload,
    downloadFile,
    getFile
} = require('../controller/materials')

const { protect, authorize } = require('../middlewares/auth')

router
    .route('/')
        .get(getMaterials)
        .post(protect, authorize('publisher', 'admin'), createMaterial) 
        
router.
    route('/:id')
        .get(getMaterial)
        .put(protect, authorize('publisher', 'admin'),updateMaterial)
        .delete(protect, authorize('publisher', 'admin'),deleteMaterial)


router.
    route('/:id/fileupload')
        .put(protect, authorize('publisher', 'admin'),fileUpload)

router.
    route('/:materialId/:filename')
    .get(protect, getFile)

router
    .route('/download/:filename')
        .get(protect, downloadFile)



module.exports = router
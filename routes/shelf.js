const express = require('express')

const {
    getShelfs,
    getShelf,
    createShelf,
    updateShelf,
    deleteShelf
} = require('../controller/shelf')

const router = express.Router()


//bring the material route
const materialRouter = require('./materials')

// this will help us to re route any request from the material router to 
// the shelf endpoint.
//so we can do //localhost:${PORT}/api/v1/shelf/shelfId/material
router.use('/:shelfId/material', materialRouter)


const { protect, authorize} = require('../middlewares/auth')

router
    .route('/')
        .get(getShelfs)
        .post(protect, authorize('publisher', 'admin'), createShelf)


router
    .route('/:id')
        .get(getShelf)
        .put(protect, authorize('publisher', 'admin'), updateShelf)
        .delete(protect, authorize('publisher', 'admin'), deleteShelf)

module.exports = router
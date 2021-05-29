const express = require('express')
const {
    getUser,
    getUsers,
    createUser,
    updateUser,
    deleteUser
} = require('../controller/user')

const router = express.Router()


const { protect, authorize } = require('../middlewares/auth')

router.use(protect)
router.use(authorize('admin'))

router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)


module.exports = router

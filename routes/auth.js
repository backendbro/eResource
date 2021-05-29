const express = require('express')

const {
    register,
    login,
    getUser,
    logoutUser,
    updateUserDetails,
    updatePassword,
    forgotPassword,
    resetPassword
} = require('../controller/auth')

const router = express.Router()

    
const { protect } = require('../middlewares/auth')

router.post('/register', register)
router.post('/login', login)
router.get('/getuser', protect, getUser)
router.get('/logout', logoutUser)
router.put('/updatedetails', protect, updateUserDetails)
router.put('/updatepassword', protect, updatePassword)
router.put('/resetpassword/:resettoken', resetPassword)
router.post('/forgotpassword', forgotPassword)

module.exports = router
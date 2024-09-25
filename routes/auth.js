const express = require('express')

const {
    register,
    login,
    getUser,
    logoutUser,
    updateUserDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    confirmEmail
} = require('../controller/auth')

const router = express.Router()

    
const { protect } = require('../middlewares/auth')

router.post('/register', register)
router.post('/login', login)
router.put('/confirm-email', protect, confirmEmail);
router.get('/getuser', protect, getUser)
router.get('/logout', logoutUser)
router.put('/update-details', protect, updateUserDetails)
router.put('/update-password', protect, updatePassword)
router.put('/reset-password/:resettoken', resetPassword)
router.post('/forgot-password', forgotPassword)

module.exports = router
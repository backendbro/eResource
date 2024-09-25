const asyncHandler = require('express-async-handler')
const User = require('../models/User');
const crypto =  require('crypto');
const ErrorResponse = require('../ultis/ErrorResponse')
const sendEmail = require('../ultis/sendEmail')

//@desc    REGISTER User
//@@route  POST /api/v1/auth/register
//@@access PUBLIC
exports.register = asyncHandler ( async ( req, res, next) => {
    
    const { name, email, password, role } = req.body
    const user = await User.create({
        name, email, password, role
    })
    
    //grab token and send to email
    const confirmEmailToken = user.generateEmailConfirmationToken()
    await user.save({ validateBeforeSave:false})
  // Create reset url
    const confirmEmailURL = `${req.protocol}://${req.get(
        'host',
    )}/api/v1/auth/confirm-email?token=${confirmEmailToken}`;

    const message = `You are receiving this email because you need to confirm your email address. Please make a GET request to: \n\n ${confirmEmailURL}`;
 
    try {
        const sendResult = await sendEmail({
            email: user.email,
            subject: 'Email confirmation token',
            message,
        });
        
    } catch (error) {
        console.log(error)
    }

    //send response token
    responseToken(user, 201, res)

})

//@desc    LOGIN User
//@@route  POST /api/v1/auth/login 
//@@access PUBLIC
exports.login = asyncHandler ( async (req, res, next) => {
    const { email, password } = req.body

    //validate  email and password
    if(!email || !password){
        return next ( new ErrorResponse(`Please fill in the empty field(s)`, 401))
    }

    //get user
    const user = await User.findOne({email}).select('+password')
    if(!user){
        return next( new ErrorResponse(`No account found with this email`, 401))
    }


    //match the passwords
    const iMatch = await user.matchPassword(password)
    if(!iMatch){
        return next( new ErrorResponse(`Wrong password. Check and try again`, 401))
    }

    //send response back
    responseToken(user, 200, res)
})

//@@desc GET Verify User's Email
//@@route GET /api/v1/confirmemail/token
//@@access PRIVATE
exports.confirmEmail = asyncHandler ( async (req, res, next) => {
    //grab token from email
    console.log(req.query)
    const { token }= req.query
    console.log(`query token: ${token}`)

    if(!token){
        return next( new ErrorResponse (`Invalid token`, 400))
    }

    
    const confirmEmailToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
    
    console.log(`ConfirmEmail: ${confirmEmailToken}`)


    //get user by token
    const user = await User.findOne({
        confirmEmailToken,
       // confirmEmailExpire:{$gt: Date.now()},
        isEmailConfirmed: false
    })

    if(!user){
        return next( new ErrorResponse(`User not found with this token`, 400))
    }

    //update confirmed to true
    user.confirmEmailToken = undefined
    user.isEmailConfirmed = true
    user.confirmEmailExpire = undefined

    //save
    user.save({validateBeforeSave:false})

    //return token
    responseToken(user, 200, res)  

})

//@desc    GET current User
//@@route  GET /api/v1/auth/me
//@@access PRIVATE
exports.getUser = asyncHandler ( async ( req, res, next) => {
    const user = await User.findById(req.user.id)
    res.status(200).json({ success:true, data: user})
})


//@desc   Log Out User
//@@route  GET /api/v1//auth/logout
//@@access PRIVATE
exports.logoutUser = asyncHandler( async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date( Date.now() + 10 * 1000),
        httpOnly:true
    })
    res.status(200).json({ success:true, data: {}})
})


//@desc    Update user details
//@@route  PUT /api/v1/auth/updatedetails
//@@access PRIVATE
exports.updateUserDetails = asyncHandler ( async (req, res, next) => {
    
    //fields to update
    const fieldsToUpdate = { 
        name: req.body.name,
        email: req.body.email
    }

    //get user
    let user = await User.findById(req.user.id)
    if(!user){
        return next( new ErrorResponse(`No user found with this email: ${req.user.id}`, 401))
    }

         user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new:true,
        runValidators:true
    })

    res.status(200).json({ success:true, data: user})
})


//@desc    Update user password
//@@route  PUT /api/v1/auth/updatepassword
//@@access PRIVATE
exports.updatePassword = asyncHandler ( async ( req, res, next) => {
    const currentPassword = req.body.newPassword
    const user = await User.findById(req.user.id).select('+password')

    //check current password
    if(!user.matchPassword(req.body.currentPassword)){
        return next( new ErrorResponse(`Old and current passwords do not match`, 401))
    }


    //change password
    user.password = req.body.newPassword
    await user.save()
    res.status(200).json({ success:true, data: user})
    


})

//@desc    Forgot password
//@@route  POST /api/v1/auth/forgotPassword
//@@access PRIVATE
exports.forgotPassword = asyncHandler ( async ( req, res, next) => {
    
    //get user
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return new ( new ErrorResponse ( `Email does not match. Provide the one associated with this account`, 401))
    }

    //get token
    const token = await user.getPasswordResetToken()
    await user.save({ validateBeforeSave:false})

    //create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${token}`
    

    const message = `You are receiving this email because you (or someone else) has
    requested the reset of a password. Please make a put request to: /n/n ${resetUrl}`
    console.log(message)

    try{
        await sendEmail ({
            email: req.body.email,
            subject: 'Password reset token',
            message
        })

        res.status(200).json({ success:true, data: 'Email sent'})
    }catch(err){
        console.log(err)

        //return resetpassword token and expiring date to undefined. to avoid security breach
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave:false})
        return next( new ErrorResponse(`Something went wrong`, 401))
    }
    
})


//@desc    Reset password
//@@route  PUT /api/v1/auth/resetpassword/:resettoken
//@@access PUBLIC

exports.resetPassword = asyncHandler ( async ( req, res, next) => {
    //get reset token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')
   
   console.log(`req token: ${req.params.resettoken}`)
    console.log(resetPasswordToken)

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now()}
    })

    if(!user){
        return next( new ErrorResponse(`Invalid token`, 401))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()
    
    responseToken(user, 200, res)
})


//response token
const responseToken = (user, statusCode, res) => {
    //create token
    const token = user.getSignedInJwtToken()
    //jwt options
    const options = {
        expires: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }

    //send the response
    res.status(statusCode)
    .cookie('token', token, options)
    .json({ success:true, token})
}


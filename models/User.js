const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const randomize = require('randomatic');


const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, 'Please add a name field']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique:true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      role:{
          type:String,
          enum: ['user', 'publisher'],
          default: 'user'
      },
      password:{
          type: String,
          required: [true, 'Please add a password'],
          minlength:6,
          select:false
      },
      resetPasswordToken: String,
      resetPasswordExpire: Date,
      confirmEmailExpire:Date,
      confirmEmailToken: String,
      isEmailConfirmed: {
        type: Boolean,
        default: false,
      },
      twoFactorCode: String,
      twoFactorCodeExpire: Date,
      twoFactorEnable: {
        type: Boolean,
        default: false,
      },
      createdAt:{
          type: Date,
          default: Date.now
      }
})


//hash password before stoing in databse
UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        next()
    }
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})


//sign in jwt and return the token
UserSchema.methods.getSignedInJwtToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRE 
    })
}

//check if passwords match
UserSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

//produce password reset token and send to client
UserSchema.methods.getPasswordResetToken = async function (){
    //create token
    const token = crypto.randomBytes(20).toString('hex')


    //hash token and store in database
    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')


    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000
    return token
}

//generate email configuration
UserSchema.methods.generateEmailConfirmationToken = function (next){
    
    //email configuration token
    const token = crypto.randomBytes(20).toString('hex')
    

    this.confirmEmailToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

    this.confirmEmailExpire = Date.now() + 10 * 60 * 1000
    console.log(`Raw token: ${token}`)
    console.log(`Encoded token: ${this.confirmEmailToken}`)
    
    return token
    
}

module.exports = mongoose.model('User', UserSchema)
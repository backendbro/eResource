const mongoose = require('mongoose')


//shelf schema
const ShelfSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
      },
      description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description can not be more than 500 characters']
      },
      phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
      },
      email: {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      }
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    
})

//shelf virtuals
  ShelfSchema.virtual('material', {
    ref:'Material',
    localField:'_id',
    foreignField:'shelf',
    justOne:false
  })

  //mongoose cascade delete middleware
  ShelfSchema.pre('remove', async function (next) {
    console.log(`Materials associated with Shelf with ID: ${this._id} is being deleted`)
    await this.model('Material').deleteMany({ shelf: this._id})
    next()
  })

module.exports = mongoose.model('Shelf', ShelfSchema)


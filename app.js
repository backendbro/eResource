const dotenv = require('dotenv')

//DOT ENV 
dotenv.config()


const express = require('express')
require('colors')
const morgan = require('morgan')
const errorHandler = require('./middlewares/error')
const connectDb = require('./database/db')
const fileupload = require('express-fileupload')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')


//app variables
const app = express()
app.use(express.json())



//connect to database
connectDb()

// Cookie middleware
app.use(cookieParser())



//morgan middlewares
if(process.env.NODE_ENV === 'production'){
    app.use(morgan('dev'))
}

//FILE UPLOADING
app.use(fileupload())

//SANITIZE DATA TO PREVENT SQL INJECTION
app.use(mongoSanitize())

//SET SECURITY HEADERS
app.use(helmet())

//PREVENT CROSS SITE SCRIPTING 
app.use(xss())

//Rate limiting
const limiter = rateLimit({
    windowMs:10 * 60 * 1000, //10 mins
    max:100
})
app.use(limiter)


//prevent HPP attack
app.use(hpp())

// ENABLE CORS
app.use(cors())


//SET STATIC FOLDER
app.use(express.static(path.join(__dirname, 'public')))
 


//bring in routes
const shelf = require('./routes/shelf')
const material = require('./routes/materials')
const auth = require('./routes/auth')
const user = require('./routes/user')


//mount routes
app.use('/api/v1/shelf', shelf)
app.use('/api/v1/material', material)
app.use('/api/v1/auth', auth)
app.use('/api/v1/user', user)





//errorHandler
app.use(errorHandler)

const PORT = process.env.PORT

//server
const server = app.listen(PORT, () => {
    console.log(`Server started on Port: ${PORT}`.brightYellow.bold)
})


//handle rejected promise
process.on('unhandledRejection', (err, promise) => {
    
    //log the error to the console
    console.log(`Error: ${err.message}`.yellow.bold)

    //crash the server
    server.close(() => process.exit(1))
})


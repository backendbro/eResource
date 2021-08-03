# eResource Api
>This a Node.js/MongoDb REST API. This backend API focuses on creating a seamless transfer of materials
between publishers and users. The tech stack include:
    
    Node.js

    Express js

    MongoDB/Mongoose

# Install Dependencies

    npm install or npm i


# The API has the following main endpoints:

    *  /api/ => index route

    *  /api/auth => handles all authentication

    * /api/shelf => performs CRUD operations on the shelf created 

    *  /api/material => performs CRUD operations on the materials created
    
    *  /api/user => performs CRUD operations on the registered users
    
 # Usage
    
   * To use this API for your project(s), perform the following steps:

   * clone this repo to your preferred IDE.

    * run yarn install or npm install to install the dependencies

    * create a config folder, followed by a config.env file inside the folder and populate it with the following constant variables;
      MONGO_URL, PORT, JWT_SECRET, JWT_EXPIRE, SMTP_PORT, SMTP_HOST, SMTP_EMAIL, SMTP_PASSWORD, FROM_NAME, FROM_EMAIL

    * run yarn dev or npm run dev 

    * open postman or a browser and visit http://localhost:PORT to hit the endpoints. 

#General notes.

    * We handled authentication to the very last. I added some modern auth features like;
      recover password, email verifictaion and update password 

⋅    *  We patched up some leaks that may occur in our database query mechanism by installing; mongoSantize

    * We limited the rate of api calls to 10mins. But can be increased to your own time frame.

    * If you are hosting this api make sure to check the < /eResource/controller/material.js > file, inorder to 
     make some minor changes to the file download/upload functions.



 
 



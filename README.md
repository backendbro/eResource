# eResource Api
>This a Node.js/MongoDb REST API. This backend API focuses on creating a seamless transfer of materials
between publishers and users. The tech stack include:
    
    Node.js

    Express js

    MongoDB/Mongoose

# Install Dependencies
 npm install
Routes

# The API has the following main endpoints:

   1. /api/ => index route

   2. /api/auth => handles all authentication

   3. /api/shelf => performs CRUD operations on the shelf created 

   4. /api/material => performs CRUD operations on the materials created
    
   5.  /api/user => performs CRUD operations on the registered users
    
  #Usage
 To use this API for your project(s), perform the following steps:

    clone this repo to your preferred IDE.

    run yarn install or npm install to install the dependencies

    create a config folder, followed by a config.env file inside the folder and populate it with the following constant variables;
    MONGO_URL, PORT, JWT_SECRET, JWT_EXPIRE, SMTP_PORT, SMTP_HOST, SMTP_EMAIL, SMTP_PASSWORD, FROM_NAME, FROM_EMAIL

    run yarn dev or npm run dev 

    open up postman or a browser and visit http://localhost:PORT to hit the endpoints. 





 
 


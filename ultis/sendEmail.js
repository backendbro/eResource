//to make these email appear in our mailbox, we will have to use 
// some form of paid mail services.
// for now we will use the console and mailtrap to view our mails



const nodemailer = require("nodemailer");

    const sendEmail = async (options) => {


  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
   
    auth: {
      user: process.env.SMTP_EMAIL, 
      pass: process.env.SMTP_PASSWORD, // generated ethereal passwor
    },
  });


  // send mail with defined transport object
  const message ={
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email, 
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message)

  console.log("Message sent: %s", info.messageId);
}

module.exports = sendEmail



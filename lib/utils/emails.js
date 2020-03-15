const nodemailer = require('nodemailer')

const service = 'gmail'
const user = 'morante413@gmail.com'
const pass = 'Whitney1512.'
const transport = nodemailer.createTransport({
  auth : { user, pass },
  service,
});


exports.sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: 'morante413@gmail.com',
    to: to,
    subject: subject,
    html: html
  }
  return transport.sendMail(mailOptions)
}
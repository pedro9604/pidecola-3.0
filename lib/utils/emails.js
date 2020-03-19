const nodemailer = require('nodemailer')

const service = 'gmail'
const user = 'pidecolausb@gmail.com'
const pass = 'Pidecolausb2020.'
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
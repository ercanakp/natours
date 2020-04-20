const SibApiV3Sdk = require('sib-api-v3-sdk');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

const defaultClient = SibApiV3Sdk.ApiClient.instance;

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jonas Schmedtmann <${process.env.EMAIL_FROM}>`;
  }

  // 1) Create a transporter
  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid

      // Below code is for SendGrid but not tested

      // return nodemailer.createTransport({
      //     service: 'SendGrid',
      //     auth: {
      //         user: process.env.SENDGRID_USERNAME,
      //         pass: process.env.SENDGRID_PASSWORD
      //     }

      // });
      // TODO: 
      // return nodemailer.createTransport({
      //   service: 'SendingBlue',
      //   auth: {
      //     user: process.env.SENDINGBLUE_USERNAME,
      //     pass: process.env.SENDINNGBLUE_PASSWORD
      //   }
      // });
      // The code below is for SendingBlue

      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Send the actual mail
  async send(template, subject) {
    // A) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`, {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    );

    // B) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Actually send the email
    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the natours family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 min)'
    );
  }
};

// ******************************************** **
// THIS FOR OLD VERSION FOR MAILGRID            **
// ******************************************** **
// The code below commented out just for reference

// const sendMail = async options => {
//     // 1) Create a transporter
//     const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USERNAME,
//             pass: process.env.EMAIL_PASSWORD
//         }
//         // Activate in gmail "less secure app" option
//     });

//     // 2) Define the email options
//     const mailOptions = {
//         from: 'Jonas Schmedtmann <hello@email.io>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//         // html:
//     };

//     // 3) Actually send the email
//     await transporter.sendMail(mailOptions);
// };

// module.exports = sendMail;
import nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
export async function sendMail(to: string, html: string) {
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: 'pwn4ddv4d6qmruel@ethereal.email', //testAccount.user,
      pass: 'tRcdr3ypEqrqHyvWxb', //testAccount.pass,
    },
  });
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
    to: to, // list of receivers
    subject: 'Change Password', // Subject line
    html,
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});


const sendStaffNewPasswordEmail = async (staffEmail, newPassword) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: staffEmail,
            subject: 'HMS - Mật khẩu đăng nhập',
            html: `
        <h2>Mật khẩu đăng nhập</h2>
        <p>Mật khẩu đăng nhập của bạn là: ${newPassword}</p>
        <p>Vui lòng đổi mật khẩu sau khi đăng nhập.</p>
        <p>Để đổi mật khẩu, vui lòng truy cập vào trang web của chúng tôi và đăng nhập.</p>
        <p>Link đăng nhập: <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
        <p>Chúc bạn một ngày tốt lành,<br>HMS Team</p>
      `
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}


module.exports = {
    sendStaffNewPasswordEmail
};

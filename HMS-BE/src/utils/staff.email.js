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

const sendPatientNewPasswordEmail = async (staffEmail, newPassword) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: staffEmail, 
            subject: 'HMS - Mật khẩu đăng nhập',
            html: `
        <h2>Mật khẩu đăng nhập</h2>
        <p>Mật khẩu đăng nhập của bạn là: ${newPassword}</p>
        <p>Vui lòng đổi mật khẩu sau khi đăng nhập.</p>
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

/**
 * Gửi email xác nhận lịch hẹn cho bệnh nhân
 * @param {string} patientEmail
 * @param {string} patientName
 * @param {string} appointmentDate - Định dạng YYYY-MM-DD
 * @param {string} appointmentTime - Định dạng HH:mm:ss
 * @param {string} doctorName
 * @param {string} clinicName
 */
const sendPatientAppointmentConfirmationEmail = async (
  patientEmail,
  patientName,
  appointmentDate,
  appointmentTime,
  doctorName,
  clinicName
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: 'HMS - Xác nhận lịch hẹn khám bệnh',
      html: `
        <h2>Xin chào ${patientName},</h2>
        <p>Bạn đã đặt lịch khám thành công trên hệ thống HMS.</p>
        <h3>Thông tin lịch hẹn:</h3>
        <ul>
          <li><b>Ngày khám:</b> ${appointmentDate}</li>
          <li><b>Giờ khám:</b> ${appointmentTime}</li>
          <li><b>Bác sĩ:</b> ${doctorName}</li>
          <li><b>Phòng khám:</b> ${clinicName}</li>
        </ul>
        <p>Vui lòng đến đúng giờ và mang theo giấy tờ tùy thân nếu cần thiết.</p>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.<br>HMS Team</p>
      `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Appointment confirmation email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
};

module.exports = {
    sendStaffNewPasswordEmail,
    sendPatientNewPasswordEmail,
    sendPatientAppointmentConfirmationEmail
};

const express = require("express");
const router = express.Router();

// Health check endpoint for Railway
router.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});
const authRouter = require("./auth.route");
const clinicRouter = require("./clinic.route");
const workScheduleRouter = require("./work-schedule.route");
const shiftRouter = require("./shift.route");
const nurseRouter = require("./nurse.route");
const doctorRouter = require("./doctor.route");
const appointmentRouter = require("./appointment.route");
const queueRouter = require("./queue.route");
const examinationRecordRouter = require("./examinationRecord.route");
const examinationOrderRouter = require("./examinationOrder.route");
const examinationDetailRouter = require("./examinationDetail.route");
const patientRouter = require("./patient.route");
const documentsRouter = require("./documents.route");
// const prescriptionItemRouter = require("./prescriptionItem.route");
const medicineRouter = require("./medicine.router");
const specialtyRouter = require("./specialty.router");
const conversationRouter = require("./conversation.route");
const chatRouter = require("./chat.route");
const userRouter = require("./user.route");
const notificationRouter = require('./notification.route');
const sepayRouter = require('./sepay.route');
const feedbackRouter = require("./feedback.route");
const statisticsRouter = require("./statistics.route");
const paymentRouter = require("./payment.routes");
const blogRouter = require("./blog.route");
const blogCategoryRouter = require("./blogCategory.route");
const blogTagRouter = require("./blogTag.route");
const invoiceRouter = require("./invoice.route");




router.use("/nurse", nurseRouter);
router.use("/doctor", doctorRouter);
router.use("/patient", patientRouter);
router.use("/auth", authRouter);
router.use("/clinic", clinicRouter);
router.use("/work-schedules", workScheduleRouter);
router.use("/shifts", shiftRouter);
router.use("/appointment", appointmentRouter);
router.use("/queue", queueRouter);
router.use("/examination-record", examinationRecordRouter);
router.use("/examination-order", examinationOrderRouter);
router.use("/examination-detail", examinationDetailRouter);
router.use("/documents", documentsRouter);
// router.use("/prescription-item", prescriptionItemRouter);
router.use("/medicine", medicineRouter);
router.use("/specialty", specialtyRouter);
router.use("/conversation", conversationRouter);
router.use("/chat", chatRouter);
router.use("/user", userRouter);
router.use('/notification', notificationRouter);
router.use('/sepay', sepayRouter);
router.use('/feedback', feedbackRouter);
router.use("/statistics", statisticsRouter);
router.use("/payment", paymentRouter);
router.use("/invoice", invoiceRouter);


router.use("/blog", blogRouter);
router.use("/blog-category", blogCategoryRouter);

router.use("/blog-tag", blogTagRouter); // ✅ mount router tag ở đây
module.exports = router;

const { BadRequestError } = require("../core/error.response")
const prisma = require("../config/prisma")

class StatisticsService {

    getTopDoctors = async () => {

        const doctorIds = await prisma.appointment.groupBy({
            by: ['doctor_id'],
            _count: {
                _all: true,
            },
            orderBy: {
                _count: {
                    doctor_id: 'desc'
                }
            },
            take: 5

        })

        const doctors = await prisma.user.findMany({
            where: {
                is_active: true,
                id: {
                    in: doctorIds.map(d => d.doctor_id)
                }
            },
            include: {
                doctor: {
                    include: {
                        specialty: true
                    }
                }
            },
        })

        const result = doctors.map(doc => ({
            id: doc.id,
            avatar: doc.avatar,
            full_name: doc.full_name,
            specialty: doc.doctor?.specialty?.name,
            appointmentCount: doctorIds.find(d => d.doctor_id === doc.id)?._count._all || 0
        }))
        // console.log(result)
        return result;
    };

    getPeriodStatistics = async (query) => {
        const { time = 'week' } = query;

        const date = new Date()
        if (time === 'today') {
            date.setDate(date.getDate() - 1)
        } else if (time === 'week') {
            date.setDate(date.getDate() - 7)
        } else if (time === 'month') {
            date.setMonth(date.getMonth() - 1); // Sửa chỗ này
        } else if (time === 'year') {
            date.setFullYear(date.getFullYear() - 1); // Sửa chỗ này
        }

        const totalPatients = await prisma.patient.count({
            where: {
                created_at: {
                    gte: date
                }
            }
        })
        // console.log(date)
        // console.log(totalPatients)
        const totalAppointments = await prisma.appointment.count(
            {
                where: {
                    created_at: {
                        gte: date
                    }
                }
            }
        )

        const payments = await prisma.payment.findMany({
            where: {
                status: "paid",
                payment_time: { gte: date },
            },
        });

        // console.log(payments)

        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

        return {
            totalPatients,
            totalAppointments,
            totalRevenue: totalRevenue
        };
    };

    getRevenuePerDayInMonth = async (month, year) => {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const payments = await prisma.payment.findMany({
            where: {
                status: "paid",
                payment_time: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        
        const resultMap = new Map();

        for (const p of payments) {
            const day = new Date(p.payment_time).getDate();
            resultMap.set(day, (resultMap.get(day) || 0) + Number(p.amount));
        }

        const daysInMonth = new Date(year, month, 0).getDate();
        const result = [];
        for (let i = 1; i <= daysInMonth; i++) {
            result.push({
                day: `${i}/${month}`,
                value: resultMap.get(i) || 0,
            });
        }

        return result;

    };
    getRevenuePerMonthInYear = async (year) => {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

        const payments = await prisma.payment.findMany({
            where: {
                status: "paid",
                payment_time: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        // console.log("payment", payments)
        const resultMap = new Map();

        for (const p of payments) {
            const month = new Date(p.payment_time).getMonth(); // 0-11
            resultMap.set(month, (resultMap.get(month) || 0) + Number(p.amount));
        }


        const thisMonth = new Date().getMonth();
        const result = [];

        // lấy tất cả các tháng từ 0 đến tháng hiện tại
        for (let i = 0; i < thisMonth + 1; i++) {
            result.push({
                month: `Tháng ${i + 1}`,
                value: resultMap.get(i) || 0,
            });
        }

        return result;

    }

    getTotalStatistics = async () => {
        //lấy tất cả
        const appointments = await prisma.appointment.findMany({
            include: {
                patient: {
                    include: {
                        user: true
                    }
                }
            }
        })

        // console.log("appointments", appointments)

        const totalAppointments = appointments.filter(appointment => appointment.priority === 1 && appointment.status === "confirmed")
        //lấy tổng khám trực tiếp
        const totalExamination = appointments.filter(appointment => appointment.priority === 0 && appointment.status === "confirmed")
        //lấy tổng hủy
        const totalCancel = appointments.filter(appointment => appointment.status === "cancelled")
        //lấy tổng bệnh nhân đặt lịch theo tuổi dưới 20
        const totalPatientUnder20 = appointments.filter(appointment => this.getAge(appointment.patient.user.date_of_birth) < 20)

        //lấy tổng bệnh nhân đặt lịch theo tuổi 20 - 40
        const totalPatient2040 = appointments.filter(appointment => this.getAge(appointment.patient.user.date_of_birth) >= 20 && this.getAge(appointment.patient.user.date_of_birth) <= 40)

        //lấy tổng bệnh nhân đặt lịch từ 40 tuổi trở lên
        const totalPatient40 = appointments.filter(appointment => this.getAge(appointment.patient.user.date_of_birth) >= 40)

        //lấy tổng bệnh nhân đặt lịch theo ngày trong monday

        const totalAppointmentsInWeek = []
        for (let i = 0; i < 7; i++) {
            const totalAppointmentsInDay = appointments.filter(appointment => {
                const day = this.getdayinweek(appointment.appointment_date.getday)
                // console.log(day, i)
                return day === i
            })
            // console.log(totalAppointmentsInDay, " thứ: ", i)
            totalAppointmentsInWeek.push(totalAppointmentsInDay.length)
        }

        return {
            totalAppointments: totalAppointments.length,
            totalExamination: totalExamination.length,
            totalCancel: totalCancel.length,
            totalPatientUnder20: totalPatientUnder20.length,
            totalPatient2040: totalPatient2040.length,
            totalPatient40: totalPatient40.length,
            totalAppointmentsInWeek: totalAppointmentsInWeek
        }
    }
    getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    getdayinweek = (date) => {
        return date.getDay()
    }
}

module.exports = new StatisticsService()
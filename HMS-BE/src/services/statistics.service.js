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
        // console.log(doctors)

        const result = doctors.map(doc => ({
            id: doc.id,
            avatar: doc.avatar,
            full_name: doc.full_name,
            specialty: doc.doctor.specialty.name,
            appointmentCount: doctorIds.find(d => d.doctor_id === doc.id)?._count._all || 0
        }))
        console.log(result)
        return result;
    };

    getPeriodStatistics = async (query) => {
        const { time = 'weekly' } = query;

        const date = new Date()
        if (time === 'daily') {
            date.setDate(date.getDate() - 1)
        } else if (time === 'weekly') {
            date.setDate(date.getDate() - 7)
        } else if (time === 'monthly') {
            date.setDate(date.getMonth() - 1)
        } else if (time === 'yearly') {
            date.setDate(date.getFullYear() - 1)
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
        const doctorIds = await prisma.appointment.groupBy({
            by: ['doctor_id'],
            _count: {
                _all: true,
            },
            where: {
                created_at: {
                    gte: date
                }
            },
        })

        const doctors = await prisma.user.findMany({
            where: {
                is_active: true,
                id: {
                    in: doctorIds.map(d => d.doctor_id)
                }
            },
            include: {
                doctor: true
            },
        })

        const payments = await prisma.payment.findMany({
            where: {
                status: "paid",
                payment_time: { gte: date },
            },
        });

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

        const resultMap = new Map();

        for (const p of payments) {
            const month = new Date(p.payment_time).getMonth(); // 0-11
            resultMap.set(month, (resultMap.get(month) || 0) + Number(p.amount));
        }

        const result = [];
        for (let i = 0; i < 12; i++) {
            result.push({
                month: `Tháng ${i + 1}`,
                value: resultMap.get(i) || 0,
            });
        }

        return result;

    };

}

module.exports = new StatisticsService()
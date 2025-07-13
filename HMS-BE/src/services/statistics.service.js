const { BadRequestError } = require("../core/error.response");
const prisma = require("../config/prisma");

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

        });

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
                },
            },
        });
        // console.log(doctors)

        const result = doctors.map(doc => ({
            id: doc.id,
            avatar: doc.avatar,
            full_name: doc.full_name,
            specialty: doc.doctor.specialty.name,
            appointmentCount: doctorIds.find(d => d.doctor_id === doc.id)?._count._all || 0
        }));
        console.log(result)
        return result;
    };

    getPeriodStatistics = async (query) => {
        const { time = 'weekly' } = query;

        const date = new Date()
        if (time === 'daily') {
            date.setDate(date.getDate() - 1);
        } else if (time === 'weekly') {
            date.setDate(date.getDate() - 7);
        } else if (time === 'monthly') {
            date.setDate(date.getMonth() - 1);
        } else if (time === 'yearly') {
            date.setDate(date.getFullYear() - 1);
        }

        const totalPatients = await prisma.patient.count({
            where: {
                created_at: {
                    gte: date
                }
            }
        });
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
        );
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
        });

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
        });

        const revenues = doctors.map(d =>
            (doctorIds.find(doc => doc.doctor_id === d.id)?._count._all || 0) * d.doctor.price
        )

        const totalRevenue = revenues.reduce((sum, e) => (sum + e), 0)

        return {
            totalPatients,
            totalAppointments,
            totalRevenue: totalRevenue
        };
    };
    
    getRevenuePerDayInMonth = async (year, month) => {
        const startDate = new Date(year, month - 1, 1); // JS: month 0-based
        const endDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of month

        const appointments = await prisma.appointment.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'done',
            },
            include: {
                doctor: true, // để lấy giá tiền
            },
        });

        const resultMap = new Map(); // day => revenue

        for (const appt of appointments) {
            const day = new Date(appt.created_at).getDate(); // 1 -> 31
            const price = appt.doctor?.price || 0;
            resultMap.set(day, (resultMap.get(day) || 0) + price);
        }

        // Format kết quả: [{ day: '1/7', value: 1000000 }, ...]
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
    getRevenuePerMonthInYear = async () => {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

        const appointments = await prisma.appointment.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
                status: 'done',
            },
            include: {
                doctor: true,
            },
        });

        const resultMap = new Map(); // month => revenue

        for (const appt of appointments) {
            const month = new Date(appt.created_at).getMonth(); // 0 -> 11
            const price = appt.doctor?.price || 0;
            resultMap.set(month, (resultMap.get(month) || 0) + price);
        }

        // Format: [{ month: 'Tháng 1', value: 1000000 }, ...]
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

module.exports = new StatisticsService();
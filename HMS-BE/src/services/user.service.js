const prisma = require('../config/prisma');

class UserService {
    // Tìm kiếm staff theo tên/email
    async searchStaff(query) {
        if (!query) return [];
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { full_name: { contains: query } },
                    { email: { contains: query } }
                ],
                role: { in: ['doctor', 'nurse', 'admin'] }
            },
            select: {
                id: true,
                full_name: true,
                email: true,
                avatar: true,
                role: true
            },
            take: 10
        });
        return users;
    }
}

module.exports = new UserService(); 
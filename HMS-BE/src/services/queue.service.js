const prisma = require("../config/prisma");

class QueueService {
    static async getQueueRoom(userId) {
        const queueRoom = await prisma.queueRoom.findMany({
            where: {
                
            }
        });
        return queueRoom;
    }
}

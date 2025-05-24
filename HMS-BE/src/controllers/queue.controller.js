const { OK } = require("../core/success.response");

class QueueController {
    static async getQueueRoom(req, res) {
        return new OK({
            message: "Get queue room successfully",
            queues: []
        }).send(res)
    }
}

module.exports = QueueController;

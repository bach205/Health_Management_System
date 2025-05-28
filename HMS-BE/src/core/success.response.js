
const StatusCode = {
    OK: 200,
    CREATED: 201
}

const ReasonStatusCode = {
    OK: 'Success',
    CREATED: 'Created'
}

class SuccessResponse {
    constructor({
        message,
        statusCode = StatusCode.OK,
        reasonStatusCode = ReasonStatusCode.OK,
        metadata = {},
        options = {}
    }) {
        this.message = message || reasonStatusCode
        this.status = statusCode
        this.reasonStatusCode = reasonStatusCode
        this.metadata = metadata
        this.options = options
    }

    send(res, headers = {}) {
        return res.status(this.status).json({
            message: this.message,
            metadata: this.metadata,
            ...this.options
        })
    }
}


class OK extends SuccessResponse {
    constructor({ message, metadata, options }) {
        super({ message, metadata, options })
    }
}

class CREATED extends SuccessResponse {
    constructor({ message, metadata, options }) {
        super({ options, message, statusCode: StatusCode.CREATED, reasonStatusCode: ReasonStatusCode.CREATED, metadata })
    }
}

module.exports = { OK, CREATED }

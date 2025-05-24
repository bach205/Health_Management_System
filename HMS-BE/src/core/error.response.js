const HttpStatusCode = {
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    URITooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451
}

// ✅ Object đúng quy tắc + message chính xác
const reasonPhrases = {
    [HttpStatusCode.BadRequest]: 'Bad Request',
    [HttpStatusCode.Unauthorized]: 'Unauthorized',
    [HttpStatusCode.PaymentRequired]: 'Payment Required',
    [HttpStatusCode.Forbidden]: 'Forbidden',
    [HttpStatusCode.NotFound]: 'Not Found',
    [HttpStatusCode.MethodNotAllowed]: 'Method Not Allowed',
    [HttpStatusCode.NotAcceptable]: 'Not Acceptable',
    [HttpStatusCode.ProxyAuthenticationRequired]: 'Proxy Authentication Required',
    [HttpStatusCode.RequestTimeout]: 'Request Timeout',
    [HttpStatusCode.Conflict]: 'Conflict',
    [HttpStatusCode.Gone]: 'Gone',
    [HttpStatusCode.LengthRequired]: 'Length Required',
    [HttpStatusCode.PreconditionFailed]: 'Precondition Failed',
    [HttpStatusCode.PayloadTooLarge]: 'Payload Too Large',
    [HttpStatusCode.URITooLong]: 'URI Too Long',
    [HttpStatusCode.UnsupportedMediaType]: 'Unsupported Media Type',
    [HttpStatusCode.RangeNotSatisfiable]: 'Range Not Satisfiable',
    [HttpStatusCode.ExpectationFailed]: 'Expectation Failed',
    [HttpStatusCode.ImATeapot]: "I'm a teapot",
    [HttpStatusCode.MisdirectedRequest]: 'Misdirected Request',
    [HttpStatusCode.UnprocessableEntity]: 'Unprocessable Entity',
    [HttpStatusCode.Locked]: 'Locked',
    [HttpStatusCode.FailedDependency]: 'Failed Dependency',
    [HttpStatusCode.TooEarly]: 'Too Early',
    [HttpStatusCode.UpgradeRequired]: 'Upgrade Required',
    [HttpStatusCode.PreconditionRequired]: 'Precondition Required',
    [HttpStatusCode.TooManyRequests]: 'Too Many Requests',
    [HttpStatusCode.RequestHeaderFieldsTooLarge]: 'Request Header Fields Too Large',
    [HttpStatusCode.UnavailableForLegalReasons]: 'Unavailable For Legal Reasons'
}

class ErrorResponse extends Error {
    constructor(
        message,
        status
    ) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.BadRequest]) {
        super(message, HttpStatusCode.BadRequest)
    }
}

class UnauthorizedError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.Unauthorized]) {
        super(message, HttpStatusCode.Unauthorized)
    }
}

class PaymentRequiredError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.PaymentRequired]) {
        super(message, HttpStatusCode.PaymentRequired)
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.Forbidden]) {
        super(message, HttpStatusCode.Forbidden)
    }
}

class NotFoundError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.NotFound]) {
        super(message, HttpStatusCode.NotFound)
    }
}

class MethodNotAllowedError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.MethodNotAllowed]) {
        super(message, HttpStatusCode.MethodNotAllowed)
    }
}

class NotAcceptableError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.NotAcceptable]) {
        super(message, HttpStatusCode.NotAcceptable)
    }
}

class ProxyAuthenticationRequiredError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.ProxyAuthenticationRequired]) {
        super(message, HttpStatusCode.ProxyAuthenticationRequired)
    }
}

class RequestTimeoutError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.RequestTimeout]) {
        super(message, HttpStatusCode.RequestTimeout)
    }
}

class ConflictError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.Conflict]) {
        super(message, HttpStatusCode.Conflict)
    }
}

class GoneError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.Gone]) {
        super(message, HttpStatusCode.Gone)
    }
}

class LengthRequiredError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.LengthRequired]) {
        super(message, HttpStatusCode.LengthRequired)
    }
}

class PreconditionFailedError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.PreconditionFailed]) {
        super(message, HttpStatusCode.PreconditionFailed)
    }
}

class PayloadTooLargeError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.PayloadTooLarge]) {
        super(message, HttpStatusCode.PayloadTooLarge)
    }
}

class URITooLongError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.URITooLong]) {
        super(message, HttpStatusCode.URITooLong)
    }
}

class UnsupportedMediaTypeError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.UnsupportedMediaType]) {
        super(message, HttpStatusCode.UnsupportedMediaType)
    }
}

class RangeNotSatisfiableError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.RangeNotSatisfiable]) {
        super(message, HttpStatusCode.RangeNotSatisfiable)
    }
}

class ExpectationFailedError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.ExpectationFailed]) {
        super(message, HttpStatusCode.ExpectationFailed)
    }
}

class ImATeapotError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.ImATeapot]) {
        super(message, HttpStatusCode.ImATeapot)
    }
}

class MisdirectedRequestError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.MisdirectedRequest]) {
        super(message, HttpStatusCode.MisdirectedRequest)
    }
}

class UnprocessableEntityError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.UnprocessableEntity]) {
        super(message, HttpStatusCode.UnprocessableEntity)
    }
}

class LockedError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.Locked]) {
        super(message, HttpStatusCode.Locked)
    }
}

class FailedDependencyError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.FailedDependency]) {
        super(message, HttpStatusCode.FailedDependency)
    }
}

class TooEarlyError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.TooEarly]) {
        super(message, HttpStatusCode.TooEarly)
    }
}

class UpgradeRequiredError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.UpgradeRequired]) {
        super(message, HttpStatusCode.UpgradeRequired)
    }
}

class PreconditionRequiredError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.PreconditionRequired]) {
        super(message, HttpStatusCode.PreconditionRequired)
    }
}

class TooManyRequestsError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.TooManyRequests]) {
        super(message, HttpStatusCode.TooManyRequests)
    }
}

class RequestHeaderFieldsTooLargeError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.RequestHeaderFieldsTooLarge]) {
        super(message, HttpStatusCode.RequestHeaderFieldsTooLarge)
    }
}

class UnavailableForLegalReasonsError extends ErrorResponse {
    constructor(message = reasonPhrases[HttpStatusCode.UnavailableForLegalReasons]) {
        super(message, HttpStatusCode.UnavailableForLegalReasons)
    }
}

module.exports = {
    ErrorResponse,
    BadRequestError,
    UnauthorizedError,
    PaymentRequiredError,
    ForbiddenError,
    NotFoundError,
    MethodNotAllowedError,
    NotAcceptableError,
    ProxyAuthenticationRequiredError,
    RequestTimeoutError,
    ConflictError,
    GoneError,
    LengthRequiredError,
    PreconditionFailedError,
    PayloadTooLargeError,
    URITooLongError,
    UnsupportedMediaTypeError,
    RangeNotSatisfiableError,
    ExpectationFailedError,
    ImATeapotError,
    MisdirectedRequestError,
    UnprocessableEntityError,
    LockedError,
    FailedDependencyError,
    TooEarlyError,
    UpgradeRequiredError,
    PreconditionRequiredError,
    TooManyRequestsError,
    RequestHeaderFieldsTooLargeError,
    UnavailableForLegalReasonsError
}

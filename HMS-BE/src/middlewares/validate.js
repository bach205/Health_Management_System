module.exports = function validate(schemas) {
    return (req, res, next) => {
        const validationErrors = [];

        if (schemas.body) {
            const { error } = schemas.body.validate(req.body, { abortEarly: false });
            if (error) validationErrors.push(...error.details.map((d) => d.message));
        }

        if (schemas.query) {
            const { error } = schemas.query.validate(req.query, { abortEarly: false });
            if (error) validationErrors.push(...error.details.map((d) => d.message));
        }

        if (schemas.params) {
            const { error } = schemas.params.validate(req.params, { abortEarly: false });
            if (error) validationErrors.push(...error.details.map((d) => d.message));
        }

        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: "Validation error",
                errors: validationErrors,
            });
        }

        next();
    };
};

import { ApiError } from '../utils/ApiError.js'

// Centralized Express error handler
// Must have 4 parameters to be recognized by Express
const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors ?? [],
            data: err.data ?? null
        })
    }

    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    return res.status(statusCode).json({
        success: false,
        message
    })
}

export default errorHandler




import { ApiError } from '../utils/ApiError.js'

// Centralized Express error handler
// Must have 4 parameters to be recognized by Express
const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        const response = {
            success: false,
            message: err.message,
            errors: err.errors ?? [],
            data: err.data ?? null
        };
        
        // Include remainingSeconds if present (for rate limiting)
        if (err.remainingSeconds !== undefined) {
            response.remainingSeconds = err.remainingSeconds;
        }
        
        return res.status(err.statusCode).json(response);
    }

    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    return res.status(statusCode).json({
        success: false,
        message
    })
}

export default errorHandler




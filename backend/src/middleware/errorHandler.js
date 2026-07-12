// Central error handling: every thrown ApiError becomes a clean JSON response,
// and Prisma unique-constraint violations become friendly 409s.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
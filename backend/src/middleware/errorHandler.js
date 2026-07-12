// Central error handling: every thrown ApiError becomes a clean JSON response,
// and Prisma unique-constraint violations become friendly 409s.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

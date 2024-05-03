const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');
let attempt = 5; //menginisialisasi percobaan login untuk passing ke messages

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const emailBefore = request.body.email;
  const email = emailBefore.toLowerCase(); // default email (huruf kecil semua)
  const password = request.body.password;

  try {
    // Check Limit login attempt
    const limitLoginSuccess = await authenticationServices.checkLoginAttempt();

    if (limitLoginSuccess) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        `Too many failed login attempts. Must Wait ${limitLoginSuccess.timeWait} minutes, to try Login again.`
      );
    }
    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      attempt--; // mengurangi attempt jika gagal login
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        `Wrong email or password, you have limit attempt ${attempt} more again`
      );
    }

    attempt = 5; // mengembalikan default value attempt, ketika login berhasil

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};

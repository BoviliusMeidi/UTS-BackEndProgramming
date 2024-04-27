const { User } = require('../../../models');
let loginAttempts = ''; // Menampung Login Attempt

/**
 * Get user by email for login information
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Get user attempt for login
 * @returns {Promise}
 */
async function getLoginAttempt() {
  return loginAttempts;
}

/**
 * Get save login attempt, by passing attempt, and date attempt
 * @param {string} attempt - Jumlah Attempt
 * @param {string} dateAttempt - Waktu Attempt
 * @returns {Promise}
 */
async function saveLoginAttempt(attempt, dateAttempt) {
  return (loginAttempts = { attempt, dateAttempt });
}

/**
 * Delete user attempt
 * @returns {Promise}
 */
async function resetLoginAttempt() {
  return (loginAttempts = { attempt: 1, dateAttempt: 0 }); // attempt 1, karena untuk pada saat pemanggilan nya memiliki default nilai 1.
  // Sehingga pada saat percobaan setelah menunggu jangka waktunya, tetap memiliki default mulai dari 1 attempt.
}

module.exports = {
  getUserByEmail,
  getLoginAttempt,
  saveLoginAttempt,
  resetLoginAttempt,
};

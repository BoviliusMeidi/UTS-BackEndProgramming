const { User, LoginTimeUsers } = require('../../../models');
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

/**
 * Mencari login time, yang sudah di add oleh function addLoginTime
 * @returns {Promise}
 */
async function searchLoginTime() {
  const loginTime = await LoginTimeUsers.findOne();
  return loginTime ? loginTime.timeLogin : null;
}

/**
 * Menambah login time, supaya ketika server terputus, maka tetap harus menunggu 30 menit untuk login
 * @param {Date} time - waktu login
 */
async function addLoginTime(time) {
  const addTime = new LoginTimeUsers({ timeLogin: time });
  await addTime.save();
}

/**
 * Menghapus login time, jika success masuk
 */
async function clearLoginTime() {
  await LoginTimeUsers.deleteMany();
}

module.exports = {
  getUserByEmail,
  getLoginAttempt,
  saveLoginAttempt,
  resetLoginAttempt,
  searchLoginTime,
  addLoginTime,
  clearLoginTime,
};

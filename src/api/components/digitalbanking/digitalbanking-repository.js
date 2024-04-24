const { DigitalBanking } = require('../../../models');
let loginAttempts = ''; //Menampung login Attempts

/**
 * Get a list of accounts digital banking
 * @returns {Promise}
 */
async function getAccounts() {
  return DigitalBanking.find({});
}

/**
 * Get Account by email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getAccountbyEmail(email) {
  return DigitalBanking.findOne({ email });
}

/**
 * Get Account by ID
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function getAccountbyID(id) {
  return DigitalBanking.findById(id);
}

/**
 * Create new account
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 */
async function createAccount(name, email, password) {
  return DigitalBanking.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing account
 * @param {string} id - Account ID
 * @param {string} name - Name
 * @param {string} email - Email
 */
async function updateAccount(id, name, email) {
  return DigitalBanking.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a account
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function deleteAccount(id) {
  return DigitalBanking.deleteOne({ _id: id });
}

/**
 * Update account password
 * @param {string} id - Account ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return DigitalBanking.updateOne({ _id: id }, { $set: { password } });
}

/**
 * Get login attempt
 * @returns {Promise}
 */
async function getLoginAttempt() {
  return loginAttempts;
}

/**
 * Login save attempt by attempt, date attempt for save login attempt
 * @param {string} attempt - Jumlah Attempt
 * @param {string} dateAttempt - Waktu Attempt
 * @returns {Promise}
 */
async function saveLoginAttempt(attempt, dateAttempt) {
  return (loginAttempts = { attempt, dateAttempt });
}

/**
 * Delete login attempt
 * @returns {Promise}
 */
async function resetLoginAttempt() {
  return (loginAttempts = { attempt: 1, dateAttempt: 0 }); // attempt 1, karena untuk pada saat pemanggilan nya memiliki default nilai 1.
  // Sehingga pada saat percobaan setelah menunggu jangka waktunya, tetap memiliki default mulai dari 1 attempt.
}

module.exports = {
  getAccounts,
  getAccountbyEmail,
  getAccountbyID,
  createAccount,
  updateAccount,
  deleteAccount,
  changePassword,
  getLoginAttempt,
  saveLoginAttempt,
  resetLoginAttempt,
};

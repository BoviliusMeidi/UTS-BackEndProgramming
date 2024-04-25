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
 * Get Account by Account Number
 * @param {string} account_number - Account Number
 * @returns {Promise}
 */
async function getAccountbyAccountNumber(account_number) {
  return DigitalBanking.findOne({ account_number });
}

/**
 * Create new account
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @param {string} balance - Saldo Awal
 * @param {string} account_number - Account Number
 */
async function createAccount(name, email, password, balance, account_number) {
  return DigitalBanking.create({
    name,
    email,
    password,
    balance,
    account_number,
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
 * Transfer Balance account
 * @param {string} account_number - Account Number
 * @param {string} sumBalance - Total Balance
 */
async function updateTransferBalance(account_number, sumBalance) {
  return DigitalBanking.updateOne(
    {
      account_number: account_number,
    },
    {
      $set: {
        balance: sumBalance,
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
  getAccountbyAccountNumber,
  createAccount,
  updateAccount,
  updateTransferBalance,
  deleteAccount,
  changePassword,
  getLoginAttempt,
  saveLoginAttempt,
  resetLoginAttempt,
};

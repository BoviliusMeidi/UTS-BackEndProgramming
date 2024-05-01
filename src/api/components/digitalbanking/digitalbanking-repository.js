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
 * Get a list of accounts with pagination digital banking
 * @param {string} page_number - Nomor halaman yang ditampilkan
 * @param {string} page_size - Jumlah data yang dimunculkan per halaman
 * @param {string} search - Filter Search, untuk mencari yang diinginkan
 * @param {string} sort - Filter Sort, untuk pengurutan data
 * @returns {Promise}
 */
async function getPagination(page_number, page_size, search, sort) {
  const fieldNameList = ['name', 'account_number', 'email', 'name']; // Untuk menampung list-list field name yang dapat dicari pengguna
  if (page_number < 0 || page_size < 0) {
    throw new Error(
      'page_number atau page_size harus bertipe integer (bilangan positif)'
    );
  }
  let results = await DigitalBanking.find();
  if (search) {
    const [fieldName, searchKey] = search.split(':'); // untuk memecah search menjadi field name dan search key tanpa ada ":"
    if (!fieldNameList.includes(fieldName)) {
      throw new Error(
        `Salah menginput parameter field name => ${fieldName}  pada 'search'`
      );
    }

    // Memeriksa apakah searchKey tidak kosong
    if (fieldName === 'account_number' && searchKey) {
      results = results.filter(
        (account) => account[fieldName] === parseInt(searchKey)
      );
    } else if (fieldName === 'name' && searchKey) {
      results = results.filter((account) =>
        account[fieldName].includes(searchKey)
      );
    } else {
      results = [];
    }
  }

  if (sort) {
    const [fieldName, sortKey] = sort.split(':'); // untuk memecah sort menjadi field name dan sort order tanpa ada ":"
    if (!fieldNameList.includes(fieldName)) {
      throw new Error(
        `Salah menginput parameter field name => ${fieldName}  pada 'sort'`
      );
    }
    const sortOptions = { [fieldName]: sortKey === 'desc' ? -1 : 1 }; // untuk opsi pengurutannya, dimana jika selain desc, maka akan di sort secara asc
    results.sort((a, b) => {
      // Metode mengurutkan elemen-elemen array
      if (a[fieldName] < b[fieldName]) return -sortOptions[fieldName];
      if (a[fieldName] > b[fieldName]) return sortOptions[fieldName];
      return 0;
    });
  }
  return results;
}

/**
 * Get an accounts transactions digital banking
 * @param {number} account_number - Account Number
 * @returns {Promise}
 */
async function getTransaction(account_number) {
  return DigitalBanking.findOne({ account_number });
}

/**
 * Get a list of accounts transactions digital banking
 * @returns {Promise}
 */
async function getTransactions() {
  const allAccount = await DigitalBanking.find();
  // Untuk hanya mendapatkan data transaction nya
  const transactions = allAccount.flatMap((account) => account.transactions);
  return transactions;
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
 * @returns {Promise}
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
 * Function mendapatkan waktu sekarang
 * @returns {Promise}
 */
async function getDateNow() {
  const date = new Date();
  const localTime = new Date(date.getTime() - (-7 * 60 * 60 * 1000));
  return localTime;
}

/**
 * Update existing account
 * @param {string} id - Account ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
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
 * Update Transfer Balance account
 * @param {string} account_number - Account Number
 * @param {string} sumBalance - Total Balance
 * @returns {Promise}
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
 * Delete transaction by id
 * @param {string} id - Account ID
 * @returns {Promise}
 */
async function deleteTransaction(id) {
  return DigitalBanking.updateOne({ _id: id }, { $set: { transactions: [] } });
}

/**
 * Delete all transaction
 * @returns {Promise}
 */
async function deleteTransactions() {
  return DigitalBanking.updateMany({ $set: { transactions: [] } });
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
 * Update account number
 * @param {string} id - account ID
 * @param {string} account_number - New account Number
 * @returns {Promise}
 */
async function changeAccountNumber(id, account_number) {
  return DigitalBanking.updateOne(
    { _id: id },
    { $set: { account_number: account_number } }
  );
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
  getPagination,
  getTransaction,
  getTransactions,
  getAccountbyEmail,
  getAccountbyID,
  getAccountbyAccountNumber,
  getDateNow,
  createAccount,
  updateAccount,
  updateTransferBalance,
  deleteTransaction,
  deleteTransactions,
  deleteAccount,
  changePassword,
  changeAccountNumber,
  getLoginAttempt,
  saveLoginAttempt,
  resetLoginAttempt,
};

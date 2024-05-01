const digitalbankingRepository = require('./digitalbanking-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const {
  generateAccountNumber,
  generateTransactionNumber,
} = require('../../../utils/account-number');
const { generateToken } = require('../../../utils/session-token');
const { default: mongoose } = require('mongoose');
const limitAttempts = 5; // Menginisialisai limit attempts
const timeMinutesAttempt = 30; // Menginisialisasi jangka waktu (menit)

/**
 * Get list of account
 * @returns {Array}
 */
async function getAccounts() {
  const accounts = await digitalbankingRepository.getAccounts();

  const results = [];
  for (let i = 0; i < accounts.length; i += 1) {
    const account = accounts[i];
    results.push({
      account_id: account.id,
      name: account.name,
      balance: account.balance,
    });
  }

  return results;
}

/**
 * Get list of account by pagination
 * @param {string} page_number - Nomor halaman yang ditampilkan
 * @param {string} page_size - Jumlah data yang dimunculkan per halaman
 * @param {string} search - Filter Search, untuk mencari yang diinginkan
 * @param {string} sort - Filter Sort, untuk pengurutan data
 * @param {string} type_pagination - Tipe Pagination Result yang diiinginkan
 * @returns {Array}
 */
async function getPagination(
  page_number,
  page_size,
  search,
  sort,
  type_pagination
) {
  const accounts = await digitalbankingRepository.getPagination(
    page_number,
    page_size,
    search,
    sort
  );

  const transactions = await getTransactions();

  const indexAwal = (page_number - 1) * page_size; // untuk membuat index awal dari users sesuai page yang dimasukkan
  const indexAkhir = page_number * page_size; // untuk membuat index akhir dari users sesuai page yang dimasukkan
  const has_previous_page = page_number > 1 ? true : false; // untuk menunjukkan apakah ada halaman sebelumnya
  const has_next_page = indexAkhir < accounts.length; // untuk Menunjukkan apakah ada halaman selanjutnya
  const results = accounts.slice(indexAwal, indexAkhir); //untuk mencari result dari index yang diberikan (indexAwal), sampai yang diberikan(indexAkhir)
  const count = results.length; //untuk jumlah total keseluruhan data

  const resultsAccount = [];

  if (type_pagination === 'account') {
    for (let i = 0; i < count; i += 1) {
      const account = accounts[i];
      resultsAccount.push({
        account_id: account.id,
        account_number: account.account_number,
        name: account.name,
      });
    }
  }

  if (type_pagination === 'transaction') {
    for (let i = 0; i < count; i += 1) {
      const transaction = transactions[i];
      resultsAccount.push({
        transaction_id: transaction.transaction_id,
        type_transaction: transaction.type_transaction,
        name_from: transaction.name_from,
        account_number_from: transaction.account_number_from,
        name_to: transaction.name_to,
        account_number_to: transaction.account_number_to,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
      });
    }
  }

  return {
    page_number,
    page_size,
    count,
    has_previous_page,
    has_next_page,
    data: resultsAccount,
  };
}

/**
 * Get account detail
 * @param {string} id - Account ID
 * @returns {Array}
 */
async function getAccount(id) {
  const account = await digitalbankingRepository.getAccountbyID(id);

  // Account not found
  if (!account) {
    return null;
  }

  return {
    account_id: account.id,
    account_number: account.account_number,
    name: account.name,
    email: account.email,
    balance: account.balance,
  };
}

/**
 * Create new account
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {string} balance - Saldo Awal
 * @returns {boolean}
 */
async function createAccount(name, email, password, balance) {
  // Hash password
  const hashedPassword = await hashPassword(password);
  const account_number = await generateAccountNumber();
  const checkAccountNumber =
    await digitalbankingRepository.getAccountbyAccountNumber(account_number);

  if (checkAccountNumber) {
    return null;
  }

  try {
    await digitalbankingRepository.createAccount(
      name,
      email,
      hashedPassword,
      balance,
      account_number
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Get account transactions
 * @param {number} account_number - Account Number
 * @returns {Array}
 */
async function getTransaction(account_number) {
  try {
    const transactions =
      await digitalbankingRepository.getTransaction(account_number);
    return transactions.transactions;
  } catch (error) {
    return null;
  }
}

/**
 * Get list of account transactions
 * @returns {Array}
 */
async function getTransactions() {
  try {
    const transactions = await digitalbankingRepository.getTransactions();
    return transactions;
  } catch (error) {
    return null;
  }
}

/**
 * Check From Account Balance for Transfer
 * @param {number} from_account_number - From Account Number
 * @param {number} balanceTransfer - Jumlah Transfer
 * @returns {boolean}
 */
async function checkBalanceTransfer(from_account_number, balanceTransfer) {
  try {
    const from_account =
      await digitalbankingRepository.getAccountbyAccountNumber(
        from_account_number
      );
    const currentBalanceFrom = from_account.balance;

    if (currentBalanceFrom < balanceTransfer) {
      return null;
    }
  } catch (error) {
    return null;
  }
  return true;
}

/**
 * Update account balance
 * @param {number} from_account_number - From Account Number
 * @param {number} to_account_number - To Account Number
 * @param {number} balanceTransfer - Jumlah Transfer
 * @returns {boolean}
 */
async function transferBalance(
  from_account_number,
  to_account_number,
  balanceTransfer
) {
  try {
    const from_account =
      await digitalbankingRepository.getAccountbyAccountNumber(
        from_account_number
      );
    const to_account =
      await digitalbankingRepository.getAccountbyAccountNumber(
        to_account_number
      );
    const currentBalanceFrom = from_account.balance;
    const from_number = from_account.account_number;
    const currentBalanceTo = to_account.balance;
    const to_number = to_account.account_number;
    const sumFromBalanceTransfer = currentBalanceFrom - balanceTransfer;
    const sumToBalanceTransfer = currentBalanceTo + balanceTransfer;
    await digitalbankingRepository.updateTransferBalance(
      from_number,
      sumFromBalanceTransfer
    );
    await digitalbankingRepository.updateTransferBalance(
      to_number,
      sumToBalanceTransfer
    );
  } catch (error) {
    return null;
  }
  return true;
}
/**
 * Update account balance
 * @param {number} to_account_number - To Account Number
 * @param {number} balanceTransfer - Jumlah Transfer
 * @returns {boolean}
 */
async function balanceDeposit(to_account_number, balanceTransfer) {
  try {
    const to_account =
      await digitalbankingRepository.getAccountbyAccountNumber(
        to_account_number
      );
    const currentBalanceTo = to_account.balance;
    const to_number = to_account.account_number;
    const sumToBalanceTransfer = currentBalanceTo + balanceTransfer;
    await digitalbankingRepository.updateTransferBalance(
      to_number,
      sumToBalanceTransfer
    );
  } catch (error) {
    return null;
  }
  return true;
}

/**
 * Save transaction
 * @param {number} from_account_number - From Account Number
 * @param {number} to_account_number - To Account Number
 * @param {number} balanceTransfer - Jumlah Transfer
 * @param {String} description - Deskripsi Transaction
 * @returns {boolean}
 */
async function saveTransaction(
  from_account_number,
  to_account_number,
  balanceTransfer,
  description
) {
  try {
    const from_account =
      await digitalbankingRepository.getAccountbyAccountNumber(
        from_account_number
      );
    const to_account =
      await digitalbankingRepository.getAccountbyAccountNumber(
        to_account_number
      );

    const fromTransaction = {
      transaction_id: generateTransactionNumber(),
      type_transaction: 'Remitter (Pengirim Transaksi)',
      name_from: from_account.name,
      account_number_from: from_account.account_number,
      name_to: to_account.name,
      account_number_to: to_account.account_number,
      amount: balanceTransfer,
      date: await digitalbankingRepository.getDateNow(),
      description: description,
    };

    const toTransaction = {
      name_from: from_account.name,
      type_transaction: 'Beneficiary (Penerima Transaksi)',
      account_number_from: from_account.account_number,
      amount: balanceTransfer,
      date: await digitalbankingRepository.getDateNow(),
      description: description,
    };

    from_account.transactions.push(fromTransaction);
    to_account.transactions.push(toTransaction);

    await from_account.save();
    await to_account.save();

    return fromTransaction;
  } catch (error) {
    return null;
  }
}

/**
 * Save deposit transaction
 * @param {number} to_account_number - To Account Number
 * @param {number} balanceTransfer - Jumlah Transfer
 * @param {String} description - Deskripsi Transaction
 * @returns {boolean}
 */
async function saveDepositTransaction(
  to_account_number,
  balanceTransfer,
  description
) {
  try {
    const to_account =
      await digitalbankingRepository.getAccountbyAccountNumber(
        to_account_number
      );

    const toTransaction = {
      name_from: to_account.name,
      type_transaction: 'Beneficiary (Penerima Transaksi)',
      account_number_from: to_account.account_number,
      amount: balanceTransfer,
      date: await digitalbankingRepository.getDateNow(),
      description: description,
    };

    to_account.transactions.push(toTransaction);
    await to_account.save();

    return toTransaction;
  } catch (error) {
    return null;
  }
}

/**
 * Update existing account
 * @param {string} id - Account ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateAccount(id, name, email) {
  const account = await digitalbankingRepository.getAccountbyID(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await digitalbankingRepository.updateAccount(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete Transaction by ID
 * @param {string} id - Account ID
 * @returns {boolean}
 */
async function deleteTransaction(id) {
  const transaction = await digitalbankingRepository.getAccountbyID(id);

  // Transaction not found
  if (!transaction) {
    return null;
  }

  try {
    await digitalbankingRepository.deleteTransaction(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete All Transactions
 * @returns {boolean}
 */
async function deleteTransactions() {
  try {
    await digitalbankingRepository.deleteTransactions();
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete account
 * @param {string} id - Account ID
 * @returns {boolean}
 */
async function deleteAccount(id) {
  const account = await digitalbankingRepository.getAccountbyID(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await digitalbankingRepository.deleteAccount(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const account = await digitalbankingRepository.getAccountbyEmail(email);

  if (account) {
    return true;
  }

  return false;
}

/**
 * Check whether the account number already have or not
 * @param {string} account_number - Account Number
 * @returns {boolean}
 */
async function accountNumberExist(account_number) {
  const accountNumber =
    await digitalbankingRepository.getAccountbyAccountNumber(account_number);

  if (accountNumber) {
    return true;
  }

  return false;
}

/**
 * Check whether the account number id is correct
 * @param {string} id - account ID
 * @returns {boolean}
 */
async function checkAccountbyId(id) {
  const defaultId = /^[0-9a-fA-F]{24}$/; // defaultId harus ada 24 karakter
  const testId = defaultId.test(id); // untuk mentest apakah sesuai dengan defaultId yang ada (24 karakter)

  if (!testId) {
    return null;
  }

  const account = await digitalbankingRepository.getAccountbyID(id);
  if (account) {
    return true;
  }
  return null;
}

/**
 * Check whether the password is correct
 * @param {string} id - account ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(id, password) {
  const account = await digitalbankingRepository.getAccountbyID(id);
  return passwordMatched(password, account.password);
}

/**
 * Check whether the account number is correct just by account number
 * @param {string} account_number - account Number
 * @returns {boolean}
 */
async function checkAccountNumberbyAccountNumber(account_number) {
  const account =
    await digitalbankingRepository.getAccountbyAccountNumber(account_number);
  if (account) {
    return true;
  }
  return null;
}

/**
 * Check whether the account number is correct
 * @param {string} id - account ID
 * @param {string} account_number - account Number
 * @returns {boolean}
 */
async function checkAccountNumber(id, account_number) {
  const account = await digitalbankingRepository.getAccountbyID(id);
  if (account.account_number === account_number) {
    return true;
  }
  return null;
}

/**
 * Change account password
 * @param {string} id - Account ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(id, password) {
  const account = await digitalbankingRepository.getAccountbyID(id);

  // Check if account not found
  if (!account) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await digitalbankingRepository.changePassword(
    id,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

/**
 * Change account number
 * @param {string} id - account ID
 * @param {string} account_number - account Number
 * @returns {boolean}
 */
async function changeAccountNumber(id, account_number) {
  const account = await digitalbankingRepository.getAccountbyID(id);

  // Check if account not found
  if (!account) {
    return null;
  }

  const changeSuccess = await digitalbankingRepository.changeAccountNumber(
    id,
    account_number
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const account = await digitalbankingRepository.getAccountbyEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const accountPassword = account
    ? account.password
    : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, accountPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (account && passwordChecked) {
    await digitalbankingRepository.resetLoginAttempt(); // untuk menghapus login attempt, jika success login.
    return {
      id: account.id,
      account_number: account.account_number,
      name: account.name,
      balance: account.balance,
      token: generateToken(account.email, account.id),
    };
  }

  return null;
}

/**
 * Check  for login attempt.
 * @returns {boolean} Mengembalikan "true", jika melebihi limit attempts.
 */
async function checkLoginAttempt() {
  const currentTime = Date.now(); // untuk menginisialisai waktu saat login diproses
  const previousAttempts =
    (await digitalbankingRepository.getLoginAttempt()) || {
      attempt: 1,
      dateAttempt: 0,
    };

  if (previousAttempts.attempt > limitAttempts) {
    const timePassed =
      (currentTime - previousAttempts.dateAttempt) / (1000 * 60); // untuk mengitung waktu yang sudah berlalu, sejak di hit user untuk login
    if (timePassed > timeMinutesAttempt) {
      digitalbankingRepository.resetLoginAttempt(); // mereset login attempt, jika waktu sudah melewati batas waktu yang ditentukan
    }
    return true;
  }
  await digitalbankingRepository.saveLoginAttempt(
    previousAttempts.attempt + 1,
    currentTime
  );
}

module.exports = {
  getAccounts,
  getPagination,
  getAccount,
  createAccount,
  getTransaction,
  getTransactions,
  checkBalanceTransfer,
  balanceDeposit,
  transferBalance,
  saveTransaction,
  saveDepositTransaction,
  updateAccount,
  deleteTransaction,
  deleteTransactions,
  deleteAccount,
  emailIsRegistered,
  checkAccountbyId,
  accountNumberExist,
  checkAccountNumberbyAccountNumber,
  checkAccountNumber,
  checkPassword,
  changePassword,
  changeAccountNumber,
  checkLoginCredentials,
  checkLoginAttempt,
};

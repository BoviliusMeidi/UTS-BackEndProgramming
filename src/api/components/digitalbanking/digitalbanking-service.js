const digitalbankingRepository = require('./digitalbanking-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { generateAccountNumber } = require('../../../utils/account-number');
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
 * Get account detail
 * @param {string} id - Account ID
 * @returns {Object}
 */
async function getAccount(id) {
  const account = await digitalbankingRepository.getAccountbyID(id);

  // Account not found
  if (!account) {
    return null;
  }

  return {
    account_id: account.id,
    name: account.name,
    email: account.email,
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

    if(currentBalanceFrom < balanceTransfer) {
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
      account_number: account.account_number,
      name: account.name,
      balance: account.balance,
      // token: generateToken(account.email, account.id),
    };
  }

  return null;
}

/**
 * Check  for login attempt.
 * @returns {object} Mengembalikan "true", jika melebihi limit attempts.
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
  getAccount,
  createAccount,
  checkBalanceTransfer,
  transferBalance,
  updateAccount,
  deleteAccount,
  emailIsRegistered,
  checkPassword,
  changePassword,
  checkLoginCredentials,
  checkLoginAttempt,
};

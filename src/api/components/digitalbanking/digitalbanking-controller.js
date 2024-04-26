const digitalbankingServices = require('./digitalbanking-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function registerAccount(request, response, next) {
  try {
    const name = request.body.name;
    const emailBefore = request.body.email;
    const email = emailBefore.toLowerCase(); // default email (huruf kecil semua)
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
    const balance = request.body.balance;
    const minimumBalance = 50000; //untuk membuat value saldo minimum

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered =
      await digitalbankingServices.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // Balance must have like minimum balance
    if (balance < minimumBalance) {
      throw errorResponder(
        errorTypes.INVALID_BALANCE_MINIMUM,
        'Less than the minimum balance'
      );
    }

    const success = await digitalbankingServices.createAccount(
      name,
      email,
      password,
      balance
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response
      .status(200)
      .json({ name, email, message: 'Success Create Bank Account' });
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function loginAccount(request, response, next) {
  const emailBefore = request.body.email;
  const email = emailBefore.toLowerCase(); // default email (huruf kecil semua)
  const password = request.body.password;

  try {
    // Check Limit login attempt
    const limitLoginSuccess = await digitalbankingServices.checkLoginAttempt();

    if (limitLoginSuccess) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'Too many failed login attempts.'
      );
    }
    // Check login credentials
    const loginSuccess = await digitalbankingServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function transferBalance(request, response, next) {
  try {
    const from_account_number = request.body.from_account_number;
    const to_account_number = request.body.to_account_number;
    const balanceTransfer = request.body.amountbalance;
    const description = request.body.description;
    const checkBalanceTransfer =
      await digitalbankingServices.checkBalanceTransfer(
        from_account_number,
        balanceTransfer
      );
    if (!checkBalanceTransfer) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Not Enough Balance for Transfer'
      );
    }

    const account = await digitalbankingServices.transferBalance(
      from_account_number,
      to_account_number,
      balanceTransfer
    );

    if (!account) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown account number'
      );
    }

    const transactionDetail = await digitalbankingServices.saveTransaction(
      from_account_number,
      to_account_number,
      balanceTransfer,
      description
    );

    return response
      .status(200)
      .json({ transactionDetail, message: 'Transfer Balance Successfull' });
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccount(request, response, next) {
  try {
    const account = await digitalbankingServices.getAccount(request.params.id);

    if (!account) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown account');
    }

    return response.status(200).json(account);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAccounts(request, response, next) {
  const type_pagination = 'account'; // Untuk Tipe Pagination Result yang diiinginkan
  const page_number = parseInt(request.query.page_number) || 1; // parseInt => untuk dirubah menjadi integer
  const page_size = parseInt(request.query.page_size) || Infinity; // parseInt => untuk dirubah menjadi integer
  const searchBefore = request.query.search;
  let search;
  if (searchBefore) {
    search = searchBefore.toLowerCase(); // Untuk menjamin fleksibilitas pengguna (case-insensitive)
  }
  const sort = request.query.sort;
  try {
    const accounts = await digitalbankingServices.getPagination(
      page_number,
      page_size,
      search,
      sort,
      type_pagination
    );
    return response.status(200).json(accounts);
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransaction(request, response, next) {
  try {
    const account_number = request.params.account_number;
    const transactions =
      await digitalbankingServices.getTransaction(account_number);
    return response.status(200).json(transactions);
  } catch (error) {
    return next(error);
  }
}
/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransactions(request, response, next) {
  const type_pagination = 'transaction'; // Untuk Tipe Pagination Result yang diiinginkan
  const page_number = parseInt(request.query.page_number) || 1; // parseInt => untuk dirubah menjadi integer
  const page_size = parseInt(request.query.page_size) || Infinity; // parseInt => untuk dirubah menjadi integer
  const searchBefore = request.query.search;
  let search;
  if (searchBefore) {
    search = searchBefore.toLowerCase(); // Untuk menjamin fleksibilitas pengguna (case-insensitive)
  }
  const sort = request.query.sort;
  try {
    const pagination = await digitalbankingServices.getPagination(
      page_number,
      page_size,
      search,
      sort,
      type_pagination
    );
    const transactions = await digitalbankingServices.getTransactions();
    // pagination.data = [...pagination.data, ...transactions]; //Menyatukan data pagination dan transaction
    return response.status(200).json({ ...pagination }); // ... || supaya tidak mengoutput title paginationnya
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateAccount(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const emailBefore = request.body.email;
    const email = emailBefore.toLowerCase(); // default email (huruf kecil semua)

    // Email must be unique
    const emailIsRegistered =
      await digitalbankingServices.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await digitalbankingServices.updateAccount(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update account'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}
/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateAccountNumber(request, response, next) {
  try {
    // Check old account number
    if (
      !(await digitalbankingServices.checkAccountNumber(
        request.params.id,
        request.body.account_number_old
      ))
    ) {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong old account number'
      );
    }
    // Check account number exist
    if (
      await digitalbankingServices.accountNumberExist(
        request.body.account_number_new
      )
    ) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Account Number Exist !!!'
      );
    }
    // Check account number confirmation
    if (
      request.body.account_number_new !== request.body.account_number_confirm
    ) {
      throw errorResponder(
        errorTypes.INVALID_ACCOUNT_NUMBER,
        'Account number confirmation mismatched'
      );
    }

    const changeSuccess = await digitalbankingServices.changeAccountNumber(
      request.params.id,
      request.body.account_number_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change account number'
      );
    }

    return response
      .status(200)
      .json({ message: 'Succesfully change account number' });
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateBalance(request, response, next) {
  try {
    const to_account_number = request.body.to_account_number;
    const balanceTransfer = request.body.amountnominal;
    const description = request.body.description;

    const account = await digitalbankingServices.balanceDeposit(
      to_account_number,
      balanceTransfer
    );

    if (!account) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown account number'
      );
    }

    const transactionDetail =
      await digitalbankingServices.saveDepositTransaction(
        to_account_number,
        balanceTransfer,
        description
      );

    return response
      .status(200)
      .json({ transactionDetail, message: 'Deposit Money Successfull' });
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteTransaction(request, response, next) {
  try {
    const id = request.params.id;

    const success = await digitalbankingServices.deleteTransaction(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete transactions'
      );
    }

    return response
      .status(200)
      .json({ message: 'Successfully delete Transactions Account Bank' });
  } catch (error) {
    return next(error);
  }
}
/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteTransactions(request, response, next) {
  try {
    const success = await digitalbankingServices.deleteTransactions();
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete transactions'
      );
    }

    return response
      .status(200)
      .json({ message: 'Successfully delete all Transactions' });
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteAccount(request, response, next) {
  try {
    const id = request.params.id;

    const success = await digitalbankingServices.deleteAccount(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete account'
      );
    }

    return response
      .status(200)
      .json({ message: 'Successfully delete account Bank' });
  } catch (error) {
    return next(error);
  }
}

/**
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function changePassword(request, response, next) {
  try {
    // Check password confirmation
    if (request.body.password_new !== request.body.password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Check old password
    if (
      !(await digitalbankingServices.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await digitalbankingServices.changePassword(
      request.params.id,
      request.body.password_new
    );

    if (!changeSuccess) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to change password'
      );
    }

    return response.status(200).json({ id: request.params.id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registerAccount,
  loginAccount,
  transferBalance,
  getAccount,
  getAccounts,
  getTransaction,
  getTransactions,
  updateAccount,
  updateAccountNumber,
  updateBalance,
  deleteTransaction,
  deleteTransactions,
  deleteAccount,
  changePassword,
};

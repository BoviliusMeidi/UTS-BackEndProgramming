const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const digitalBankingControlllers = require('./digitalbanking-controller');
const digitalBankingValidator = require('./digitalbanking-validator');
const celebrate = require('../../../core/celebrate-wrappers');

const route = express.Router();

module.exports = (app) => {
  app.use('/digitalbanking', route);

  // Register Account
  route.post(
    '/register',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.registerAccount),
    digitalBankingControlllers.registerAccount
  );

  // Login Account
  route.post(
    '/login',
    celebrate(digitalBankingValidator.loginAccount),
    digitalBankingControlllers.loginAccount
  );

  // For Transfer Balance
  route.post(
    '/login/transfer',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.transaction),
    digitalBankingControlllers.transferBalance
  );

  // Get list of account
  route.get(
    '/account',
    authenticationMiddleware,
    digitalBankingControlllers.getAccounts
  );

  // Get Account by ID
  route.get(
    '/account/:id',
    authenticationMiddleware,
    digitalBankingControlllers.getAccount
  );

  // Get account transactions
  route.get(
    '/transactions/:account_number',
    authenticationMiddleware,
    digitalBankingControlllers.getTransaction
  );

  // Get list of transactions
  route.get(
    '/transactions',
    authenticationMiddleware,
    digitalBankingControlllers.getTransactions
  );

  // Update Account
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.updateAccount),
    digitalBankingControlllers.updateAccount
  );

  // Update Account Number
  route.put(
    '/:id/change-account-number',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.updateAccountNumber),
    digitalBankingControlllers.updateAccountNumber
  );

  // Update Balance Amount (Setor Uang)
  route.put(
    '/:id/deposit-money',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.updateBalance),
    digitalBankingControlllers.updateBalance
  );

  // Change Account Password
  route.put(
    '/:id/change-password',
    authenticationMiddleware,
    celebrate(digitalBankingValidator.changePassword),
    digitalBankingControlllers.changePassword
  );

  // Delete Transaction by Account ID
  route.delete(
    '/transactions/:id',
    authenticationMiddleware,
    digitalBankingControlllers.deleteTransaction
  );

  // Delete All Transaction
  route.delete(
    '/transactions',
    authenticationMiddleware,
    digitalBankingControlllers.deleteTransactions
  );

  // Delete Account
  route.delete(
    '/profile/:id',
    authenticationMiddleware,
    digitalBankingControlllers.deleteAccount
  );
};

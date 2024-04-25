const express = require('express');

const digitalBankingControlllers = require('./digitalbanking-controller');
const digitalBankingValidator = require('./digitalbanking-validator');
const celebrate = require('../../../core/celebrate-wrappers');

const route = express.Router();

module.exports = (app) => {
  app.use('/digitalbanking', route);

  // Register Account
  route.post(
    '/register',
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
    '/login/transfer',celebrate(digitalBankingValidator.transferBalance),
    digitalBankingControlllers.transferBalance
  );

  // Get list of account
  route.get('/account', digitalBankingControlllers.getAccounts);

  // Get Account by ID
  route.get('/profile/:id', digitalBankingControlllers.getAccount);

  // Update Account
  route.put(
    '/profile/:id',
    celebrate(digitalBankingValidator.updateAccount),
    digitalBankingControlllers.updateAccount
  );

  // Delete Account
  route.delete('/profile/:id', digitalBankingControlllers.deleteAccount);
};

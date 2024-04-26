const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  registerAccount: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('Password'),
      password_confirm: joi.string().required().label('Password confirmation'),
      balance: joi.number().required().label('Balance'),
    },
  },

  loginAccount: {
    body: {
      email: joi.string().email().required().label('Email'),
      password: joi.string().required().label('Password'),
    },
  },

  transaction: {
    body: {
      to_account_number: joi.number().required().label('To Account Number'),
      from_account_number: joi.number().required().label('From Account Number'),
      amountbalance: joi.number().required().label('Amount Balance'),
      description: joi
        .string()
        .min(1)
        .max(256)
        .required()
        .label('Description Transaction'),
    },
  },

  updateAccount: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
    },
  },

  updateAccountNumber: {
    body: {
      account_number_old: joi.number().required().label('Old Account Number'),
      account_number_new: joi
        .number()
        .min(1e11)
        .max(1e12 - 1)
        .required()
        .label('New Account Number')
        .messages({
          'number.min': 'Password harus memiliki setidaknya 12 digit',
          'number.max': 'Password tidak boleh lebih dari 12 digit',
        }),
      account_number_confirm: joi
        .number()
        .required()
        .label('Account Number Confirmation'),
    },
  },

  updateBalance: {
    body: {
      to_account_number: joi.number().required().label('To Account Number'),
      amountnominal: joi.number().required().label('Amount Nominal'),
      description: joi
        .string()
        .min(1)
        .max(256)
        .required()
        .label('Description Transaction'),
    },
  },

  changePassword: {
    body: {
      password_old: joi.string().required().label('Old password'),
      password_new: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('New password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },
};

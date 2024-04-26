const digitalbankingSchema = {
  name: String,
  email: String,
  password: String,
  account_number: Number,
  balance: Number,
  transactions: [
    {
      transaction_id: String,
      type_transaction: String,
      name_from: String,
      account_number_from: Number,
      name_to: String,
      account_number_to: Number,
      amount: Number,
      date: Date,
      description: String,
    },
  ],
};

module.exports = digitalbankingSchema;

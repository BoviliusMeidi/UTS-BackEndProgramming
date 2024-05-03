const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const { usersSchema, loginTimeUsers } = require('./users-schema');
const {
  digitalbankingSchema,
  loginTimeDigitalBanking,
} = require('./digitalbanking-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));
const DigitalBanking = mongoose.model(
  'digitalbanking',
  mongoose.Schema(digitalbankingSchema)
);
const LoginTimeUsers = mongoose.model(
  'logintimeusers',
  mongoose.Schema(loginTimeUsers)
);
const LoginTimeDigitalBanking = mongoose.model(
  'logintimedigitalbanking',
  mongoose.Schema(loginTimeDigitalBanking)
);

module.exports = {
  mongoose,
  User,
  DigitalBanking,
  LoginTimeUsers,
  LoginTimeDigitalBanking,
};

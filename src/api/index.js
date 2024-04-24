const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');
const digitalbanking = require('./components/digitalbanking/digitalbanking-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  digitalbanking(app);

  return app;
};

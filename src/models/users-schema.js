const usersSchema = {
  name: String,
  email: String,
  password: String,
};

const loginTimeUsers = {
  timeLogin: String,
};
module.exports = { usersSchema, loginTimeUsers };

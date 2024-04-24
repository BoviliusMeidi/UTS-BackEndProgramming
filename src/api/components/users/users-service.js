const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers() {
  const users = await usersRepository.getUsers();

  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Get list of user pagination
 * @param {string} page_number - Nomor halaman yang ditampilkan
 * @param {string} page_size - Jumlah data yang dimunculkan per halaman
 * @param {string} search - Filter Search, untuk mencari yang diinginkan
 * @param {string} sort - Filter Sort, untuk pengurutan data
 * @returns {Array}
 */
async function getPaginationUsers(page_number, page_size, search, sort) {
  const users = await usersRepository.getPaginationUsers(
    page_number,
    page_size,
    search,
    sort
  );

  const indexAwal = (page_number - 1) * page_size; // untuk membuat index awal dari users sesuai page yang dimasukkan
  const indexAkhir = page_number * page_size; // untuk membuat index akhir dari users sesuai page yang dimasukkan
  const has_previous_page = page_number > 1 ? true : false; // untuk menunjukkan apakah ada halaman sebelumnya
  const has_next_page = indexAkhir < users.length; // untuk Menunjukkan apakah ada halaman selanjutnya
  const results = users.slice(indexAwal, indexAkhir); //untuk mencari result dari index yang diberikan (indexAwal), sampai yang diberikan(indexAkhir)
  const count = results.length; //untuk jumlah total keseluruhan data

  const resultUsers = []; // Untuk menampungkan result User dengan format yang diinginkan
  for (let i = 0; i < count; i += 1) {
    const user = results[i];
    resultUsers.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return {
    page_number,
    page_size,
    count,
    has_previous_page,
    has_next_page,
    data: resultUsers,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
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
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  getPaginationUsers,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};

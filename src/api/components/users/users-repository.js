const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Get user detail pagination
 * @param {string} page_number - Nomor halaman yang ditampilkan
 * @param {string} page_size - Jumlah data yang dimunculkan per halaman
 * @param {string} search - Filter Search, untuk mencari yang diinginkan
 * @param {string} sort - Filter Sort, untuk pengurutan data
 * @returns {Promise}
 */
async function getPaginationUsers(page_number, page_size, search, sort) {
  const fieldNameList = ['email', 'name']; // Untuk menampung list-list field name yang dapat dicari pengguna
  if (page_number < 0 || page_size < 0) {
    throw new Error(
      'page_number atau page_size harus bertipe integer (bilangan positif)'
    );
  }
  let results = await User.find();
  if (search) {
    const [fieldName, searchKey] = search.split(':'); // untuk memecah search menjadi field name dan search key tanpa ada ":"
    if (!fieldNameList.includes(fieldName)) {
      throw new Error(
        `Salah menginput parameter field name => ${fieldName}  pada 'search'`
      );
    }

    // Memeriksa apakah searchKey tidak kosong
    if (searchKey) {
      results = results.filter((user) => user[fieldName].includes(searchKey));
    } else {
      results = [];
    }
  }

  if (sort) {
    const [fieldName, sortKey] = sort.split(':'); // untuk memecah sort menjadi field name dan sort order tanpa ada ":"
    if (!fieldNameList.includes(fieldName)) {
      throw new Error(
        `Salah menginput parameter field name => ${fieldName}  pada 'sort'`
      );
    }
    const sortOptions = { [fieldName]: sortKey === 'desc' ? -1 : 1 }; // untuk opsi pengurutannya
    results.sort((a, b) => {
      // Metode mengurutkan elemen-elemen array
      if (a[fieldName] < b[fieldName]) return -sortOptions[fieldName];
      if (a[fieldName] > b[fieldName]) return sortOptions[fieldName];
      return 0;
    });
  }
  return results;
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

module.exports = {
  getUsers,
  getUser,
  getPaginationUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
};

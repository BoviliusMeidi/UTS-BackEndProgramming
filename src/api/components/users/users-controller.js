const usersService = require('./users-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get list of users request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUsers(request, response, next) {
  const page_number = parseInt(request.query.page_number);
  const page_size = parseInt(request.query.page_size);
  const search = request.query.search;
  const sort = request.query.sort;

  try {
    const users = await usersService.getUsers();
    let results = users;
    if (search) {
      const [fieldName, searchKey] = search.split(':'); // untuk memecah search menjadi field name dan search key tanpa ada ":"
      if (!['email', 'name'].includes(fieldName)) {
        throw new Error(
          `Salah menginput parameter field name => ${fieldName}  pada 'search'`
        );
      }

      // Memeriksa apakah searchKey tidak kosong
      if (searchKey) {
        results = results.filter((user) => user[fieldName].includes(searchKey));
        console.log(results);
      } else {
        results = [];
      }
    }

    if (sort) {
      const [fieldName, sortKey] = sort.split(':'); // untuk memecah sort menjadi field name dan sort order tanpa ada ":"
      if (!['email', 'name'].includes(fieldName)) {
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
    const indexAwal = (page_number - 1) * page_size; // untuk membuat index awal dari users sesuai page yang dimasukkan
    const indexAkhir = page_number * page_size; // untuk membuat index akhir dari users sesuai page yang dimasukkan
    const has_previous_page = page_number > 1 ? true : false;
    const has_next_page = indexAkhir < results.length;
    results = results.slice(indexAwal, indexAkhir); //untuk mencari result dari index yang diberikan (indexAwal), sampai yang diberikan(indexAkhir)

    const count = results.length;

    return response.status(200).json({
      page_number,
      page_size,
      count,
      has_previous_page,
      has_next_page,
      data: results,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get user detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getUser(request, response, next) {
  try {
    const user = await usersService.getUser(request.params.id);

    if (!user) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown user');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createUser(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.createUser(name, email, password);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateUser(request, response, next) {
  try {
    const id = request.params.id;
    const name = request.body.name;
    const email = request.body.email;

    // Email must be unique
    const emailIsRegistered = await usersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    const success = await usersService.updateUser(id, name, email);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete user request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteUser(request, response, next) {
  try {
    const id = request.params.id;

    const success = await usersService.deleteUser(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle change user password request
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
      !(await usersService.checkPassword(
        request.params.id,
        request.body.password_old
      ))
    ) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    const changeSuccess = await usersService.changePassword(
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
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
};

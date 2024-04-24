const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const limitAttempts = 5; // Menginisialisai limit attempts
const timeMinutesAttempt = 30; // Menginisialisasi jangka waktu (menit)

/**
 * Check username and password for login.
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {object} An object containing, among others, the JWT token if the email and password are matched. Otherwise returns null.
 */
async function checkLoginCredentials(email, password) {
  const user = await authenticationRepository.getUserByEmail(email);

  // We define default user password here as '<RANDOM_PASSWORD_FILTER>'
  // to handle the case when the user login is invalid. We still want to
  // check the password anyway, so that it prevents the attacker in
  // guessing login credentials by looking at the processing time.
  const userPassword = user ? user.password : '<RANDOM_PASSWORD_FILLER>';
  const passwordChecked = await passwordMatched(password, userPassword);

  // Because we always check the password (see above comment), we define the
  // login attempt as successful when the `user` is found (by email) and
  // the password matches.
  if (user && passwordChecked) {
    await authenticationRepository.resetLoginAttempt(); // untuk menghapus login attempt, jika success login.
    return {
      email: user.email,
      name: user.name,
      user_id: user.id,
      token: generateToken(user.email, user.id),
    };
  }

  return null;
}

/**
 * Check  for login attempt.
 * @returns {object} Mengembalikan "true", jika melebihi limit attempts.
 */
async function checkLoginAttempt() {
  const currentTime = Date.now(); // untuk menginisialisai waktu saat login diproses
  const previousAttempts =
    (await authenticationRepository.getLoginAttempt()) || {
      attempt: 1,
      dateAttempt: 0,
    };

  if (previousAttempts.attempt > limitAttempts) {
    const timePassed =
      (currentTime - previousAttempts.dateAttempt) / (1000 * 60); // untuk mengitung waktu yang sudah berlalu, sejak di hit user untuk login
    if (timePassed > timeMinutesAttempt) {
      authenticationRepository.resetLoginAttempt(); // mereset login attempt, jika waktu sudah melewati batas waktu yang ditentukan
    }
    return true;
  }
  await authenticationRepository.saveLoginAttempt(
    previousAttempts.attempt + 1,
    currentTime
  );
}

module.exports = {
  checkLoginCredentials,
  checkLoginAttempt,
};

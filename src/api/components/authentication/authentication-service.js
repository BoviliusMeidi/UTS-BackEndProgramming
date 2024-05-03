const authenticationRepository = require('./authentication-repository');
const { generateToken } = require('../../../utils/session-token');
const { passwordMatched } = require('../../../utils/password');
const limitAttempts = 5; // Menginisialisai limit attempts
const timeMinutesWaitAttempt = 30; // Menginisialisasi jangka waktu (menit)
let timeAdd = true; // Menginialisasi nilai, untuk looping if, pada bagian pencatatan waktu saat login mengenai limit

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
 * @returns {Object} Mengembalikan "true" dan "timeWait", jika melebihi limit attempts.
 */
async function checkLoginAttempt() {
  const currentTime = Date.now(); // untuk menginisialisai waktu saat login diproses
  const previousAttempts =
    (await authenticationRepository.getLoginAttempt()) || {
      attempt: 1,
      dateAttempt: 0,
    };

  const timeAtLimit = await authenticationRepository.searchLoginTime(); // waktu saat limit melampaui 5 kali
  const timePassed = (currentTime - timeAtLimit) / (1000 * 60); // untuk menghitung waktu yang sudah berlalu, sejak di hit user untuk login
  const timeWait = (timeMinutesWaitAttempt - timePassed).toFixed(2); // menghitung sisa waktu tunggu, untuk mencoba login berikutnya
  if (timePassed < timeMinutesWaitAttempt) {
    return { success: true, timeWait: timeWait };
  }
  if (timePassed > timeMinutesWaitAttempt) {
    timeAdd = true;
    await authenticationRepository.clearLoginTime(); // mereset waktu login, jika sudah melewati batas waktu
    authenticationRepository.resetLoginAttempt(); // mereset login attempt, jika waktu sudah melewati batas waktu yang ditentukan
  }

  if (previousAttempts.attempt > limitAttempts) {
    if (timeAdd === true) {
      await authenticationRepository.addLoginTime(previousAttempts.dateAttempt);
      timeAdd = false;
    }
    return { success: true, timeWait: '30 minutes' };
  }
  // Menyimpan login attempt
  await authenticationRepository.saveLoginAttempt(
    previousAttempts.attempt + 1,
    currentTime
  );
}

module.exports = {
  checkLoginCredentials,
  checkLoginAttempt,
};

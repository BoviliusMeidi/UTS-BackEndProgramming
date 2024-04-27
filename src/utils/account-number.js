/**
 * Generate Account Number
 * @returns {string} Account Number
 */
function generateAccountNumber() {
  // Menggunakan Date.now() untuk mengenerate angka secara acak
  // Menggunakan Math.random() untuk mengenerate angka secara acak
  // Jadi Account Numbernya, merupakan gabungan antara Date.now() dan Math.random()
  const randomNumberOne = Date.now().toString().slice(-8); //Mengambil 8 angka terakhir
  const randomNumberTwo = Math.floor(1000 + Math.random() * 9000); // Mengambil angka antara 1000 - 9999
  return `${randomNumberOne}${randomNumberTwo}`;
}

/**
 * Generate Transaction Number
 * @returns {string} Transaction Number
 */
function generateTransactionNumber() {
  // Menggunakan Date.now() untuk mengenerate angka secara acak
  // Menggunakan Math.random() untuk mengenerate angka secara acak
  // Jadi Transactions Numbernya, merupakan gabungan antara Date.now() dan Math.random()
  const randomNumberOne = Date.now().toString().slice(-12); //Mengambil 12 angka terakhir
  const randomNumberTwo = Math.floor(100000 + Math.random() * 900000); // Mengambil angka antara 100000 - 999999
  return `${randomNumberOne}${randomNumberTwo}`;
}
module.exports = { generateAccountNumber, generateTransactionNumber };

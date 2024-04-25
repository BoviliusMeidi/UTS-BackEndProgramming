
/**
 * Generate Account Number
 * @returns {string} Account Number
 */
function generateAccountNumber() {
  // Menggunakan Date.now() untuk mengenerate angka secara acak
  // Menggunakan Math.random() untuk mengenerate angka secara acak
  // Jadi accountNumbernya, merupakan gabungan antara Date.now() dan Math.random()
  const randomNumberOne = Date.now().toString().slice(-9); //Mengambil 9 angka terakhir
  const randomNumberTwo = Math.floor(1000 + Math.random() * 9000); // Mengambil angka antara 1000 - 9999
  return `${randomNumberOne}${randomNumberTwo}`;
}
module.exports = { generateAccountNumber };

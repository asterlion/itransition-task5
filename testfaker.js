const SeedRandom = require('random-seed');

const seed = '42'; // Пример сид
const rng = SeedRandom(seed); // Создаем генератор случайных чисел с указанным сидом

// Генерируем несколько случайных чисел для тестирования
for (let i = 0; i < 10; i++) {
    console.log('Random Number:', rng()); // Должно вернуть число
}
console.log('Seed:', seed);
console.log('Generator:', rng);
console.log('Random Number:', rng());

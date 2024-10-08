const cors = require('cors');
const express = require('express');
const { faker } = require('@faker-js/faker');
const { fakerRU, fakerPL, fakerDE, fakerEN } = require('@faker-js/faker');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const SeedRandom = require('random-seed');

const app = express();
app.use(cors());
app.use(express.json());

function generateRandomData(region, errorsPerRecord, seed, pageNumber) {
    try {
        const combinedSeed = Number(seed) + Number(pageNumber); // Комбинируем сид и номер страницы
        const errorCount = Number(errorsPerRecord);
        faker.seed(combinedSeed); // Устанавливаем сид для faker
        const rng = SeedRandom(combinedSeed); // Создаем генератор случайных чисел с сидом
        const data = [];

        for (let i = 0; i < 20; i++) {
            const record = {
                id: i + 1,
                uuid: faker.string.uuid(),
                name: generateName(region),
                address: generateAddress(region),
                phone: generatePhoneNumber(region),
            };
            console.log(`Record before applying errors:`, record);
            console.log(`Error Count: ${errorCount}`);
            console.log(`Random Generator: ${rng}`);
            applyErrors(record, errorCount, rng); // Передаем генератор
            data.push(record);
        }
        return data;
    } catch (error) {
        console.error('Error in generateRandomData:', error);
        throw error;
    }
}

// Генерация имени в зависимости от региона
function generateName(region) {
    switch (region) {
        case 'by': // Беларусь (русская локализация)
            return fakerRU.person.fullName();
        case 'pl': // Польша
            return fakerPL.person.fullName();
        case 'de': // Германия
            return fakerDE.person.fullName();
        case 'en': // Англоязычные страны
            return fakerEN.person.fullName();
        default:   // По умолчанию — английская локализация
            return fakerEN.person.fullName();
    }
}

function generateAddress(region) {
    switch (region) {
        case 'by': // Беларусь
            return generateBelarusAddress();
        case 'en': // Англоязычные страны
            return generateUSAddress();
        case 'de': // Германия
            return generateGermanyAddress();
        case 'pl': // Польша
            return generatePolandAddress();
        default:
            return faker.location.streetAddress(); // Общее случайное значение
    }
}

// Генерация адреса для Беларуси
function generateBelarusAddress() {

    const formats = [
        () => `${fakerRU.location.city()}, ${fakerRU.location.streetAddress()}, кв. ${faker.number.int({ min: 1, max: 500 })}`,
        () => `${fakerRU.location.city()}, ${fakerRU.location.secondaryAddress()}, ${fakerRU.location.state()}`,
        () => `${fakerRU.location.city()}, ул. ${fakerRU.location.street()}, д. ${faker.number.int({ min: 1, max: 100 })}, кв. ${faker.number.int({ min: 1, max: 500 })}`,
        () => `село ${fakerRU.location.city()}, ул. ${fakerRU.location.street()}, д. ${faker.number.int({ min: 1, max: 100 })}`
    ];
    return faker.helpers.arrayElement(formats)();
}

// Генерация адреса для США
function generateUSAddress() {
    const formats = [
        () => `${faker.location.city()}, ${faker.location.state()}, ${faker.location.zipCode()}, ${faker.location.streetAddress()}`,
        () => `${faker.location.city()}, ${faker.location.zipCode()}, ${faker.location.secondaryAddress()}`,
    ];
    return faker.helpers.arrayElement(formats)();
}

// Генерация адреса для Германии
function generateGermanyAddress() {
    const formats = [
        () => `${faker.location.city()}, ${faker.location.zipCode()}, ${faker.location.streetAddress()} ${faker.number.int({ min: 1, max: 100 })}`,
        () => `${faker.location.city()}, ${faker.location.zipCode()}, ${faker.location.street()} ${faker.number.int({ min: 1, max: 100 })}`,
    ];
    return faker.helpers.arrayElement(formats)();
}

// Генерация адреса для Польши
function generatePolandAddress() {
    const formats = [
        () => `${faker.location.city()}, ${faker.location.zipCode()}, ${faker.location.street()} ${faker.number.int({ min: 1, max: 100 })}`,
        () => `${faker.location.city()}, ${faker.location.zipCode()}, ul. ${faker.location.street()} ${faker.number.int({ min: 1, max: 100 })}, m. ${faker.number.int({ min: 1, max: 500 })}`,
    ];
    return faker.helpers.arrayElement(formats)();
}

function generatePhoneNumber(region) {
    let phoneNumber;

    switch (region) {
        case 'by':
            phoneNumber = parsePhoneNumberFromString(faker.phone.number(), 'BY');
            break;
        case 'en': // English-speaking countries
            phoneNumber = parsePhoneNumberFromString(faker.phone.number(), 'US');
            break;
        case 'de': // Germany
            phoneNumber = parsePhoneNumberFromString(faker.phone.number(), 'DE');
            break;
        case 'pl': // Poland
            phoneNumber = parsePhoneNumberFromString(faker.phone.number(), 'PL');
            break;
        default:
            phoneNumber = parsePhoneNumberFromString(faker.phone.number());
            break;
    }

    return phoneNumber ? phoneNumber.formatInternational() : faker.phone.number();
}

// Обновленная функция applyErrors
function applyErrors(record, errorCount) {
    console.log(`Applying ${errorCount} errors to record:`, record);

    if (errorCount === 0) {
        return; // Если ошибок нет, просто возвращаем запись
    }

    const fields = ['name', 'address', 'phone'];

    for (let i = 0; i < Math.floor(errorCount); i++) {
        const fieldIndex = Math.floor(Math.random() * fields.length);
        const field = fields[fieldIndex];

        console.log(`Altering field '${field}' in record`);

        const errorType = Math.floor(Math.random() * 3);
        switch (errorType) {
            case 0:
                record[field] = removeRandomCharacter(record[field]);
                break;
            case 1:
                record[field] = addRandomCharacter(record[field]);
                break;
            case 2:
                record[field] = swapAdjacentCharacters(record[field]);
                break;
        }
        console.log(`New ${field}: ${record[field]}`);
    }

    // Обработка вероятностной ошибки
    if (Math.random() < (errorCount % 1)) {
        const fieldIndex = Math.floor(Math.random() * fields.length);
        const field = fields[fieldIndex];
        record[field] = removeRandomCharacter(record[field]);
        console.log(`Probabilistic error added to ${field}: ${record[field]}`);
    }

    console.log(`Final record after errors:`, record);
}

// Обновленные функции для обработки ошибок
function removeRandomCharacter(str) {
    if (str.length === 0) return str;
    const index = Math.floor(Math.random() * str.length);
    return str.slice(0, index) + str.slice(index + 1);
}

function addRandomCharacter(str) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    const index = Math.floor(Math.random() * (str.length + 1));
    return str.slice(0, index) + randomChar + str.slice(index);
}

function swapAdjacentCharacters(str) {
    if (str.length < 2) return str;
    const index = Math.floor(Math.random() * (str.length - 1));
    const arr = str.split('');
    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    return arr.join('');
}

app.get('/', (req, res) => {
    res.send('Hello Task5!');
});

app.post('/generate', (req, res) => {
    const { region, errors, seed, page } = req.body;
    console.log('Received request:', { region, errors, seed, page });

    try {
        // Комбинируем пользовательский seed с номером страницы
        const combinedSeed = parseInt(seed, 10) + page; // Корректное преобразование
        const data = generateRandomData(region, errors, combinedSeed, page);
        res.json(data);
    } catch (error) {
        console.error('Error handling /generate:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/random-seed', (req, res) => {
    const randomSeed = Math.floor(Math.random() * 10000); // Генерация случайного seed
    res.json({ seed: randomSeed });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

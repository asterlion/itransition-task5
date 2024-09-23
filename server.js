const cors = require('cors');
const express = require('express');
const { faker } = require('@faker-js/faker');

const app = express();
app.use(cors());
app.use(express.json());

function generateRandomData(region, errorsPerRecord, seed, pageNumber) {
    try {
        faker.seed(seed + pageNumber);
        const data = [];

        for (let i = 0; i < 20; i++) {
            const record = {
                id: i + 1,
                uuid: faker.string.uuid(),
                name: faker.person.fullName(),
                address: generateAddress(region),
                phone: generatePhoneNumber(region),
            };
            applyErrors(record, errorsPerRecord);
            data.push(record);
        }
        return data;
    } catch (error) {
        console.error('Error in generateRandomData:', error);
        throw error;
    }
}

function generateAddress(region) {
    return faker.location.streetAddress();
}

function generatePhoneNumber(region) {
    return faker.phone.number();
}

function applyErrors(record, errorsPerRecord) {
    for (let i = 0; i < errorsPerRecord; i++) {
        const field = Math.floor(Math.random() * 3);
        if (field === 0) {
            record.name = removeRandomCharacter(record.name);
        } else if (field === 1) {
            record.address = removeRandomCharacter(record.address);
        } else if (field === 2) {
            record.phone = removeRandomCharacter(record.phone);
        }
    }
}

function removeRandomCharacter(str) {
    if (str.length === 0) return str;
    const index = Math.floor(Math.random() * str.length);
    return str.slice(0, index) + str.slice(index + 1);
}

app.get('/', (req, res) => {
    res.send('Hello Task5!');
});

app.post('/generate', (req, res) => {
    const { region, errors, seed, page } = req.body;
    console.log('Received request:', { region, errors, seed, page });
    try {
        const data = generateRandomData(region, errors, seed, page);
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

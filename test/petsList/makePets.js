const fs = require('fs');
const faker = require('faker');
const _ = require('lodash');

const pets = [];

for (let i = 0; i < 1000; ++i) {
  const pet = {
    name: faker.name.firstName(),
    age: _.random(1, 30),
    gender: _.sample(['F', 'M']),
  };
  pets.push(pet);
}

fs.writeFileSync(`${__dirname}/pets.json`, JSON.stringify(pets, true, 2));

import _ from 'lodash';
import Bottle from 'bottlejs';

import c from '../../src';

export default() => {
  const b = new Bottle();

  b.constant('pets', c.toData([], 'pets'));

  b.constant('malePets', c.toData([], 'malePets'));
  b.constant('femalePets', c.toData([], 'femalePets'));
  b.constant('oldestPets', c.toData([], 'oldestPets'));
  b.constant('oldestMalePets', c.toData([], 'oldestMalePets'));
  b.constant('oldestFemalePets', c.toData([], 'oldestFemalePets'));

  b.factory('petsToGender', (container) => {
    container.pets.filterTo(pets => pets.filter(pet => pet.gender === 'M'))
      .into(container.malePets).init();
    container.pets.filterTo(pets => pets.filter(pet => pet.gender === 'F'))
      .into(container.femalePets).init();
  });

  b.constant('oldestReducer', (oldest, pet) => {
    if (!oldest.length) return [pet];
    if (pet.age > oldest[0].age) return [pet];
    if (pet.age === oldest[0].age) return oldest.concat([pet]);
    return oldest;
  });

  b.factory('getOldest', (container) => {
    container.pets.reduceTo(container.oldestReducer, container.oldestPets).init();
    container.malePets.reduceTo(container.oldestReducer, container.oldestMalePets).init();
    container.femalePets.reduceTo(container.oldestReducer, container.oldestFemalePets).init();
  });

  return b.container;
};

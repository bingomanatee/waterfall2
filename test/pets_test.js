import _ from 'lodash';
import eventsFn from './events';

import pets from './petsList/pets';
import petsList from './petsList/petsList';

/**
 * ensuring that only changed data triggers updates;
 *
 */
describe('memo', () => {
  let petsContainer;
  let mEvents;
  let fEvents;
  let events;

  beforeEach(() => {
    petsContainer = petsList();
    petsContainer.pets.replace(_.cloneDeep(pets));
    const toGender = petsContainer.petsToGender;
    mEvents = eventsFn(petsContainer.malePets);
    fEvents = eventsFn(petsContainer.femalePets);
  });

  it('should distribute all the pets', () => {
    const petsCount = petsContainer.pets.length;
    const malePetsCount = petsContainer.malePets.length;
    const femalePetsCount = petsContainer.femalePets.length;

    expect(malePetsCount + femalePetsCount).toEqual(petsCount);
  });

  it('should sort properly', () => {
    expect(_(petsContainer.malePets.raw()).map('gender').uniq().value()).toEqual(['M']);
    expect(_(petsContainer.femalePets.raw()).map('gender').uniq().value()).toEqual(['F']);
  });

  it('should not update the male list when a female pet is added', () => {
    petsContainer.pets.push({ name: 'trixie', age: 10, gender: 'F' });
    expect(mEvents.changes.length).toEqual(0);
    expect(fEvents.changes.length).toEqual(1);
  });

  describe('age calculation', () => {
    let omEvents;
    let ofEvents;
    beforeEach(() => {
      const oldest = petsContainer.getOldest;
      mEvents = eventsFn(petsContainer.malePets);
      fEvents = eventsFn(petsContainer.femalePets);
      ofEvents = eventsFn(petsContainer.oldestFemalePets);
      omEvents = eventsFn(petsContainer.oldestMalePets);
      events = eventsFn(petsContainer.pets);
    });

    it('should get the oldest dogs', () => {
      expect(petsContainer.oldestMalePets.raw())
        .toEqual([
          { age: 32, gender: 'M', name: 'Rex' },
          { age: 32, gender: 'M', name: 'Lassie' },
        ]);
      expect(petsContainer.oldestFemalePets.raw())
        .toEqual([
          { age: 32, gender: 'F', name: 'Sally' },
          { age: 32, gender: 'F', name: 'Mark' },
        ]);
      expect(petsContainer.oldestPets.raw())
        .toEqual([{ age: 32, gender: 'M', name: 'Rex' },
          { age: 32, gender: 'F', name: 'Sally' },
          { age: 32, gender: 'M', name: 'Lassie' },
          { age: 32, gender: 'F', name: 'Mark' }]);
    });

    it('should not update oldest lists when young dogs are added', () => {
      petsContainer.pets.push({ name: 'fluffy', age: 3, gender: 'M' });
      expect(omEvents.changes.length).toEqual(0);
      expect(ofEvents.changes.length).toEqual(0);
    });

    it('should update only one oldest lists when an old dog is are added', () => {
      petsContainer.pets.push({ name: 'Muffin', age: 40, gender: 'M' });
      expect(omEvents.changes.length).toEqual(1);
      expect(ofEvents.changes.length).toEqual(0);
      expect(mEvents.changes.length).toEqual(1);
      expect(fEvents.changes.length).toEqual(0);
      expect(petsContainer.oldestMalePets.raw())
        .toEqual([
          { name: 'Muffin', age: 40, gender: 'M' },
        ]);
    });
  });
});

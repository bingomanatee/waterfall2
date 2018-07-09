

import bottle from '../src/bottle';
import eventsFn from './events';

describe('Data', () => {
  let b;
  let c;
  let dataArray;
  let targetArray;
  let events;
  beforeEach(() => {
    b = bottle();
    c = b.container;
    dataArray = c.toData([1, 2, 3, 4], 'numbers');
    targetArray = c.toData([], 'bigNumbers');
    dataArray.mapTo(n => 10 * n, targetArray);
    events = eventsFn(targetArray);
  });

  describe('DataArray', () => {
    describe('.toMap', () => {
      it('should instantly initalize the target', () => {
        expect(targetArray.raw()).toEqual([10, 20, 30, 40]);
      });

      describe('on set', () => {
        beforeEach(() => {
          dataArray.set(2, -7);
        });

        it('should update the target value', () => {
          expect(targetArray.raw()).toEqual([10, 20, -70, 40]);
        });

        it('should send the right events', () => {
          expect(events.changes.length).toEqual(1);
          expect(events.updates.length).toEqual(1);
          expect(events.adds.length).toEqual(0);
          expect(events.removes.length).toEqual(0);
          expect(events.splices.length).toEqual(0);
          expect(events.other.length).toEqual(0);
        });
      });

      describe('on remove', () => {
        beforeEach(() => {
          dataArray.remove(2);
        });

        it('should update the target value', () => {
          expect(targetArray.raw()).toEqual([10, 20, 40]);
        });

        it('should send the right events', () => {
          expect(events.changes.length).toEqual(1);
          expect(events.updates.length).toEqual(0);
          expect(events.adds.length).toEqual(0);
          expect(events.removes.length).toEqual(0);
          expect(events.splices.length).toEqual(1);
          expect(events.other.length).toEqual(0);
        });
      });
    });
  });
});

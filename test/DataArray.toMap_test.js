

import bottle from '../src/bottle';
import eventsFn from './events';

describe('Data', () => {
  let b;
  let c;
  let dataArray;
  let events;
  let fromEvents;

  describe('DataArray', () => {
    beforeEach(() => {
      b = bottle();
      c = b.container;
      dataArray = c.toData([1, 2, 3, 4], 'numbers');
      fromEvents = eventsFn(dataArray);
    });
    describe('.toMap', () => {
      describe('(to a map)', () => {
        let targetMap;
        beforeEach(() => {
          targetMap = c.toData(new Map(), 'bigNumberMap');
          dataArray.mapTo((n) => {
            if (typeof n !== 'number') {
              return 0;
            }
            return 10 * n;
          }, targetMap);
          events = eventsFn(targetMap);
        });

        it('should instantly initalize the target', () => {
          expect(targetMap.entries).toEqual([
            [0, 10],
            [1, 20],
            [2, 30],
            [3, 40],
          ]);
        });

        describe('on set', () => {
          describe('(update)', () => {
            beforeEach(() => {
              dataArray.set(2, -7);
            });

            it('should trigger the expected events', () => {
              expect(events.changes.length).toEqual(1);
              expect(events.updates.length).toEqual(1);
              expect(events.adds.length).toEqual(0);
              expect(events.removes.length).toEqual(0);
              expect(events.splices.length).toEqual(0);
              expect(events.other.length).toEqual(0);
            });

            it('should produce the expected target', () => {
              expect(targetMap.entries).toEqual([
                [0, 10],
                [1, 20],
                [2, -70],
                [3, 40],
              ]);
            });
          });
          describe('(add)', () => {
            beforeEach(() => {
              dataArray.set(6, -7);
            });

            it('should trigger the expected events', () => {
              expect(events.changes.length).toEqual(4);
              expect(events.updates.length).toEqual(1);
              expect(events.adds.length).toEqual(3);
              expect(events.removes.length).toEqual(0);
              expect(events.splices.length).toEqual(0);
              expect(events.other.length).toEqual(0);
            });

            it('should produce the expected target', () => {
              // console.log('target events: ', JSON.stringify(fromEvents.changes, true, 2));
              expect(targetMap.entries).toEqual([
                [0, 10],
                [1, 20],
                [2, 30],
                [3, 40],
                [4, 0],
                [5, 0],
                [6, -70],
              ]);
            });
          });
        });
      });

      describe('(to another array)', () => {
        let targetArray;
        beforeEach(() => {
          targetArray = c.toData([], 'bigNumbers');
          dataArray.mapTo(n => 10 * n, targetArray);
          events = eventsFn(targetArray);
        });

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

        describe('on remove (splices)', () => {
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

        describe('on splice', () => {
          beforeEach(() => {
            dataArray.splice(2, 2, 9, 11, 15);
          });

          it('should update the target value', () => {
            expect(targetArray.raw()).toEqual([10, 20, 90, 110, 150]);
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
});

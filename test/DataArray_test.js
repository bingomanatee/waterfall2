import bottle from '../src/bottle';
import eventsFn from './events';

describe('Data', () => {
  let b;
  let c;

  beforeEach(() => {
    b = bottle();
    c = b.container;
  });

  describe('DataArray', () => {
    let events;
    let dataArray;
    beforeEach(() => {
      dataArray = c.toData([1, 2, 3, 4], 'someItems');
      events = eventsFn(dataArray);
    });

    describe('type', () => {
      it('should have the array type', () => {
        expect(dataArray.type).toEqual(c.DATATYPE_ARRAY);
      });
    });

    describe('events', () => {
      describe('set', () => {
        beforeEach(() => {
          dataArray.set(2, 10);
        });

        it('should send the right events', () => {
          expect(events.changes.length).toEqual(1);
          expect(events.updates.length).toEqual(1);
          expect(events.adds.length).toEqual(0);
          expect(events.removes.length).toEqual(0);
          expect(events.splices.length).toEqual(0);
          expect(events.other.length).toEqual(0);
        });

        it('should have the data name', () => {
          const msg = events.updates[0];
          expect(msg.data).toEqual('someItems');
        });

        it('should have the expected change', () => {
          const msg = events.updates[0];
          const { index, newValue } = msg.change;
          expect(index).toEqual(2);
          expect(newValue).toEqual(10);
        });

        it('should produce the expected array', () => {
          expect(dataArray.values).toEqual([1, 2, 10, 4]);
        });
      });

      describe('splice', () => {
        beforeEach(() => {
          dataArray.splice(2, 0, 100, 200, 300);
        });

        it('should send the right events', () => {
          expect(events.changes.length).toEqual(1);
          expect(events.updates.length).toEqual(0);
          expect(events.adds.length).toEqual(0);
          expect(events.removes.length).toEqual(0);
          expect(events.splices.length).toEqual(1);
          expect(events.other.length).toEqual(0);
        });

        it('should have the data name', () => {
          const msg = events.splices[0];
          expect(msg.data).toEqual('someItems');
        });

        it('should have the expected change', () => {
          const msg = events.splices[0];
          const {
            index, removed, added, removedCount, addedCount,
          } = msg.change;
          expect(index).toEqual(2);
          expect(removed).toEqual([]);
          expect(added).toEqual([100, 200, 300]);
          expect(removedCount).toEqual(0);
          expect(addedCount).toEqual(3);
        });

        it('should produce the expected map', () => {
          expect(dataArray.values).toEqual([1, 2, 100, 200, 300, 3, 4]);
        });
      });

      describe('remove', () => {
        beforeEach(() => {
          dataArray.remove(2);
        });

        it('should send the right events', () => {
          expect(events.changes.length).toEqual(1);
          expect(events.updates.length).toEqual(0);
          expect(events.adds.length).toEqual(0);
          expect(events.removes.length).toEqual(0);
          expect(events.splices.length).toEqual(1);
          expect(events.other.length).toEqual(0);
        });

        it('should have the expected change', () => {
          const msg = events.splices[0];
          const {
            index, removed, added, removedCount, addedCount,
          } = msg.change;
          expect(index).toEqual(2);
          expect(removed).toEqual([3]);
          expect(added).toEqual([]);
          expect(removedCount).toEqual(1);
          expect(addedCount).toEqual(0);
        });

        it('should produce the expected map', () => {
          expect(dataArray.values).toEqual([1, 2, 4]);
        });
      });
    });
  });
});

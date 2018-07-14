import bottle from '../src/bottle';
import eventsFn from './events';

describe('Data', () => {
  let b;
  let c;

  beforeEach(() => {
    b = bottle();
    c = b.container;
  });

  describe('DataMap', () => {
    let events;
    let dataMap;
    beforeEach(() => {
      dataMap = c.toData(new Map([['a', 1], ['b', 2], ['c', 3]]), 'someItems');
      events = eventsFn(dataMap);
    });

    describe('type', () => {
      it('should have the map type', () => {
        expect(dataMap.type).toEqual(c.DATATYPE_MAP);
      });
    });

    describe('events', () => {
      describe('set', () => {
        beforeEach(() => {
          dataMap.set('a', 10);
        });

        it('should send the right events', () => {
          expect(events.changes.length).toEqual(1);
          expect(events.updates.length).toEqual(1);
          expect(events.adds.length).toEqual(0);
          expect(events.removes.length).toEqual(0);
          expect(events.other.length).toEqual(0);
        });

        it('should have the data name', () => {
          const msg = events.updates[0];
          expect(msg.data).toEqual('someItems');
        });

        it('should have the expected change', () => {
          const msg = events.updates[0];
          const { name, newValue } = msg.change;
          expect(name).toEqual('a');
          expect(newValue).toEqual(10);
        });

        it('should produce the expected map', () => {
          const mapAsObj = {};
          dataMap.entries.forEach(([key, value]) => {
            mapAsObj[key] = value;
          });
          expect(mapAsObj).toEqual({ a: 10, b: 2, c: 3 });
        });
      });

      describe('add', () => {
        beforeEach(() => {
          dataMap.set('d', 4);
        });

        it('should send the right events', () => {
          expect(events.changes.length).toEqual(1);
          expect(events.updates.length).toEqual(0);
          expect(events.adds.length).toEqual(1);
          expect(events.removes.length).toEqual(0);
          expect(events.other.length).toEqual(0);
        });

        it('should have the data name', () => {
          const msg = events.adds[0];
          expect(msg.data).toEqual('someItems');
        });

        it('should have the expected change', () => {
          const msg = events.adds[0];
          const { name, newValue } = msg.change;
          expect(name).toEqual('d');
          expect(newValue).toEqual(4);
        });

        it('should produce the expected map', () => {
          const mapAsObj = {};
          dataMap.entries.forEach(([key, value]) => {
            mapAsObj[key] = value;
          });
          expect(mapAsObj).toEqual({
            a: 1, b: 2, c: 3, d: 4,
          });
        });
      });

      describe('remove', () => {
        beforeEach(() => {
          dataMap.remove('b');
        });

        it('should send the right events', () => {
          // console.log('events.changes:', JSON.stringify(changes, true, 2));

          expect(events.changes.length).toEqual(1);
          expect(events.updates.length).toEqual(0);
          expect(events.adds.length).toEqual(0);
          expect(events.removes.length).toEqual(1);
          expect(events.other.length).toEqual(0);
        });

        it('should have the expected change', () => {
          const msg = events.removes[0];
          const { name } = msg.change;
          expect(name).toEqual('b');
        });

        it('should produce the expected map', () => {
          const mapAsObj = {};
          dataMap.entries.forEach(([key, value]) => {
            mapAsObj[key] = value;
          });
          expect(mapAsObj).toEqual({ a: 1, c: 3 });
        });
      });

      describe('replace', () => {
        beforeEach(() => {
          dataMap.content = new Map([['a', 1], ['c', 4], ['e', 10]]);
        });

        it('should send the right events', () => {
          expect(events.changes.length).toEqual(1);
          expect(events.updates.length).toEqual(0);
          expect(events.adds.length).toEqual(0);
          expect(events.replaces.length).toEqual(1);
          expect(events.removes.length).toEqual(0);
          expect(events.other.length).toEqual(0);
        });

        it('should produce the expected map', () => {
          const mapAsObj = {};
          dataMap.entries.forEach(([key, value]) => {
            mapAsObj[key] = value;
          });
          expect(mapAsObj).toEqual({ a: 1, c: 4, e: 10 });
        });
      });
    });
  });
});

import bottle from '../src/bottle';
import eventsFn from './events';

describe('Data', () => {
  let b;
  let c;

  beforeEach(() => {
    b = bottle();
    c = b.container;
  });

  describe('DataValue', () => {
    let dataValue;
    let events;

    beforeEach(() => {
      dataValue = c.toData(40, 'count');
      events = eventsFn(dataValue);
    });

    describe('type', () => {
      it('should have the map type', () => {
        expect(dataValue.type).toEqual(c.DATATYPE_VALUE);
      });
    });

    describe('events', () => {
      describe('replace', () => {
        let msg;
        beforeEach(() => {
          dataValue.content = 30;
          msg = events.replaces[0];
        });

        it('should send the right events', () => {
          expect(events.changes.length).toEqual(1);
          expect(events.updates.length).toEqual(0);
          expect(events.replaces.length).toEqual(1);
          expect(events.adds.length).toEqual(0);
          expect(events.removes.length).toEqual(0);
          expect(events.other.length).toEqual(0);
        });

        it('should have the data name', () => {
          expect(msg.data).toEqual('count');
        });

        it('should have the expected change', () => {
          const { name, newValue } = msg.change;
          expect(newValue).toEqual(30);
        });

        it('should produce the expected object', () => {
          expect(dataValue.raw()).toEqual(30);
        });
      });
    });
  });
});

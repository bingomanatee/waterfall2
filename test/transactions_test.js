import bottle from '../src/bottle';
import eventsFn from './events';

describe('Data', () => {
  let b;
  let c;
  let data;
  let events;
  beforeEach(() => {
    b = bottle();
    c = b.container;
  });

  describe('transactions', () => {
    describe('array', () => {
      beforeEach(() => {
        data = c.toData(
          [1, 2, 3, 4],
          'nums',
        );
        events = eventsFn(data);
        data.transStart();
      });

      describe('set', () => {
        beforeEach(() => {
          data.set(1, 10);
        });

        it('should have an active transaction', () => {
          expect(data.hasTrans).toBeTruthy();
        });

        it('should not send events when in a transaction', () => {
          expect(events.changes.length).toEqual(0);
        });

        it('should still reflect old values', () => {
          expect(data.content).toEqual([1, 2, 3, 4]);
        });

        describe('after close', () => {
          beforeEach(() => {
            data.transEnd();
          });

          it('should have the new values', () => {
            expect(data.content).toEqual([1, 10, 3, 4]);
          });
          it('should have no active transaction', () => {
            expect(data._activeTrans).toBeFalsy();
          });

          it('should have one change', () => {
            expect(events.changes.length).toEqual(1);
            expect(events.batchs.length).toEqual(1);
          });
        });

        describe('after revert', () => {
          beforeEach(() => {
            data.transRevert();
          });

          it('should have the new values', () => {
            expect(data.content).toEqual([1, 2, 3, 4]);
          });
          it('should have no active transaction', () => {
            expect(data._activeTrans).toBeFalsy();
          });
        });
      });
    });
  });
});

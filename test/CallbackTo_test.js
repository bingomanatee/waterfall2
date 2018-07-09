import bottle from '../src/bottle';

describe('utilities', () => {
  let b;
  let c;

  beforeEach(() => {
    b = bottle();
    c = b.container;
  });

  describe('Data', () => {
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    let keysChanged;
    let dataMap;

    describe('.toCallback', () => {
      describe('(without target)', () => {
        beforeEach(() => {
          dataMap = c.toData(map, 'theMap');
          keysChanged = [];

          dataMap.callbackTo((theMap, change) => {
            if (change.data === 'theMap') {
              if (Reflect.has(change.change, 'name')) {
                keysChanged.push(change.change.name);
              }
            }
          });
        });

        it('should start empty', () => {
          expect(keysChanged.length).toEqual(0);
        });

        it('should log a single change', () => {
          dataMap.set('a', 5);
          expect(keysChanged).toEqual(['a']);
        });

        it('should log multiple changes', () => {
          dataMap.set('a', 5);
          dataMap.set('b', 33);
          expect(keysChanged).toEqual(['a', 'b']);
        });
      });
    });
  });
});

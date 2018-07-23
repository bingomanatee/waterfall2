import bottle from '../src/bottle';

describe('Data', () => {
  let b;
  let c;

  beforeEach(() => {
    b = bottle();
    c = b.container;
  });
  const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
  let keysChanged;
  let dataMap;

  describe('.filterTo', () => {
    describe('(with target)', () => {
      let target;
      beforeEach(() => {
        const targetMap = new Map([['min', ''], ['max', '']]);
        target = c.toData(targetMap, 'range');
        dataMap = c.toData(map, 'theMap');

        dataMap.filterTo((theMap) => {
          let min = null;
          let max = null;
          let minValue;
          let maxValue;
          const range = new Map();

          Array.from(theMap.entries()).forEach(([key, value]) => {
            if (!min || (value < minValue)) {
              minValue = value;
              min = key;
            }
            if (!max || (value > maxValue)) {
              maxValue = value;
              max = key;
            }
          });

          range.set('min', min);
          range.set('max', max);
          return range;
        }, target).init();
      });

      it('should initialize', () => {
        expect(target.get('min')).toEqual('a');
        expect(target.get('max')).toEqual('c');
      });

      it('should reflect changes', () => {
        dataMap.set('d', -100);
        expect(target.get('min')).toEqual('d');
        expect(target.get('max')).toEqual('c');
      });

      it('should reflect changes 2', () => {
        dataMap.set('d', 200);
        expect(target.get('min')).toEqual('a');
        expect(target.get('max')).toEqual('d');
      });
    });
    describe('(without target)', () => {
      beforeEach(() => {
        dataMap = c.toData(map, 'theMap');
        keysChanged = [];

        dataMap.filterTo((theMap, change) => {
          if (change.data === 'theMap') {
            if (change.change.name) {
              keysChanged.push(change.change.name);
            }
          }
        }).init();
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

import bottle from '../src/bottle';

describe('Data', () => {
  let b;
  let c;
  const values = [1, 23, 5, 3, -9, 100];
  let dataArray;

  beforeEach(() => {
    b = bottle();
    c = b.container;
  });

  describe('.reduceTo', () => {
    let target;
    describe('with target', () => {
      beforeEach(() => {
        target = c.toData(new Map(), 'range');
        dataArray = c.toData(values, 'numbers');

        dataArray.reduceTo((memo, value, idx) => {
          if (Number.isNaN(value)) {
            return memo;
          }
          if (!memo.has('min')) {
            memo.set('min', idx);
            memo.set('max', idx);
            memo.set('minValue', value);
            memo.set('maxValue', value);
            return memo;
          }
          if (memo.get('maxValue') < value) {
            memo.set('max', idx);
            memo.set('maxValue', value);
          } else
          if (memo.get('minValue') > value) {
            memo.set('min', idx);
            memo.set('minValue', value);
          }
          return memo;
        }, target).init();
      });

      it('should initialize', () => {
        expect(target.get('min')).toEqual(4);
        expect(target.get('max')).toEqual(5);
        expect(target.get('minValue')).toEqual(-9);
        expect(target.get('maxValue')).toEqual(100);
      });

      it('should reflect change', () => {
        dataArray.push(-200);
        expect(target.get('min')).toEqual(6);
        expect(target.get('max')).toEqual(5);
        expect(target.get('minValue')).toEqual(-200);
        expect(target.get('maxValue')).toEqual(100);
      });
    });
  });
});

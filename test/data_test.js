import bottle from '../src/bottle';

describe('utilities', () => {
  let b;
  let c;

  beforeEach(() => {
    b = bottle();
    c = b.container;
  });

  describe('toData', () => {
    const value = 1;
    const array = [1, 2, 3];
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    const object = { a: 1, b: 2, c: 3 };

    describe('typing', () => {
      it('should encapsulate value types', () => {
        expect(c.toData(value).type).toEqual(c.DATATYPE_VALUE);
      });

      it('should encapsulate array types', () => {
        expect(c.toData(array).type).toEqual(c.DATATYPE_ARRAY);
      });

      it('should encapsulate object types', () => {
        expect(c.toData(object).type).toEqual(c.DATATYPE_OBJECT);
      });

      it('should encapsulate map types', () => {
        expect(c.toData(map).type).toEqual(c.DATATYPE_MAP);
      });
    });
  });
});

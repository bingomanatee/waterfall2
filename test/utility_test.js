import bottle from '../src/bottle';

describe('utilities', () => {
  let b;
  let c;

  beforeEach(() => {
    b = bottle();
    c = b.container;
  });

  describe('type constants', () => {
    it('should have nonempty constants', () => {
      expect(c.DATATYPE_VALUE).toBeTruthy();
      expect(c.DATATYPE_ARRAY).toBeTruthy();
      expect(c.DATATYPE_OBJECT).toBeTruthy();
      expect(c.DATATYPE_MAP).toBeTruthy();
    });
  });

  describe('dataType', () => {
    const value = 1;
    const array = [1, 2, 3];
    const map = new Map([['a', 1], ['b', 2], ['c', 3]]);
    const object = { a: 1, b: 2, c: 3 };

    it('should identify value types', () => {
      expect(c.dataType(value)).toEqual(c.DATATYPE_VALUE);
    });

    it('should identify array types', () => {
      expect(c.dataType(array)).toEqual(c.DATATYPE_ARRAY);
    });

    it('should identify object types', () => {
      expect(c.dataType(object)).toEqual(c.DATATYPE_OBJECT);
    });

    it('should identify map types', () => {
      expect(c.dataType(map)).toEqual(c.DATATYPE_MAP);
    });
  });
});

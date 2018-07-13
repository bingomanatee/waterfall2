import bottle from '../src/bottle';
import eventsFn from './events';

describe('types', () => {
  let b;
  let c;

  beforeEach(() => {
    b = bottle();
    c = b.container;
  });

  it('should identify arrays', () => {
    expect(c.typeof([])).toEqual('Array');
  });
  it('should identify objects', () => {
    expect(c.typeof({})).toEqual('object');
  });
  it('should identify null', () => {
    expect(c.typeof(null)).toEqual('empty');
  });
  it('should identify Maps', () => {
    expect(c.typeof(new Map())).toEqual('Map');
  });
  it('should identify DATATYPES', () => {
    expect(c.typeof(c.DATATYPE_MAP)).toEqual('DATATYPE');
    expect(c.typeof(c.DATATYPE_OBJECT)).toEqual('DATATYPE');
    expect(c.typeof(c.DATATYPE_ARRAY)).toEqual('DATATYPE');
    expect(c.typeof(c.DATATYPE_VALUE)).toEqual('DATATYPE');
  });

  it('should identify Data', () => {
    expect(c.typeof(c.toData([]))).toEqual('Data');
  });
});

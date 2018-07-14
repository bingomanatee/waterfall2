import { includes } from 'lodash';

export default (bottle) => {
  bottle.constant('DATATYPE_MAP', Symbol('DATATYPE_MAP'));
  bottle.constant('DATATYPE_OBJECT', Symbol('DATATYPE_OBJECT'));
  bottle.constant('DATATYPE_ARRAY', Symbol('DATATYPE_ARRAY'));
  bottle.constant('DATATYPE_VALUE', Symbol('DATATYPE_VALUE'));

  bottle.factory('DATATYPES', c => [c.DATATYPE_MAP, c.DATATYPE_OBJECT,
    c.DATATYPE_ARRAY, c.DATATYPE_VALUE]);

  bottle.factory('typeof', c => (identifyMe) => {
    if (!identifyMe) return 'empty';

    if (identifyMe instanceof c.Data) return 'Data';

    if (identifyMe instanceof Map) return 'Map';

    if (Array.isArray(identifyMe)) return 'Array';

    if (includes(c.DATATYPES, identifyMe)) {
      return 'DATATYPE';
    }

    return typeof identifyMe;
  });

  bottle.factory('dataType', c => (item) => {
    if (item === null) return c.DATATYPE_VALUE;
    if (Array.isArray(item)) return c.DATATYPE_ARRAY;
    if (item instanceof Map) return c.DATATYPE_MAP;
    if (typeof item === 'object') return c.DATATYPE_OBJECT;
    return c.DATATYPE_VALUE;
  });

  bottle.factory('blankOf', c => (dataType) => {
    if (!(c.typeof(dataType) === 'DATATYPE')) {
      throw new Error(`cannot Blankof ${dataType}`);
    }
    let out = {};
    switch (dataType) {
      case c.DATATYPE_ARRAY:
        out = [];
        break;

      case c.DATATYPE_MAP:
        out = new Map();
        break;

      case c.DATATYPE_OBJECT:
        out = {};
        break;

      default:
        console.log('Cthulu lives');
    }
    return out;
  });
};

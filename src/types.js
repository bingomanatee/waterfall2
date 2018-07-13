import { includes } from 'lodash';

export default (b) => {
  b.constant('DATATYPE_MAP', Symbol('DATATYPE_MAP'));
  b.constant('DATATYPE_OBJECT', Symbol('DATATYPE_OBJECT'));
  b.constant('DATATYPE_ARRAY', Symbol('DATATYPE_ARRAY'));
  b.constant('DATATYPE_VALUE', Symbol('DATATYPE_VALUE'));

  b.factory('DATATYPES', c => [c.DATATYPE_MAP, c.DATATYPE_OBJECT,
    c.DATATYPE_ARRAY, c.DATATYPE_VALUE]);

  b.factory('typeof', c => (identifyMe) => {
    if (!identifyMe) return 'empty';

    if (identifyMe instanceof c.Data) return 'Data';

    if (identifyMe instanceof Map) return 'Map';

    if (Array.isArray(identifyMe)) return 'Array';

    if (includes(c.DATATYPES, identifyMe)) {
      return 'DATATYPE';
    }

    return typeof identifyMe;
  });

  b.factory('blankOf', c => (dataType) => {
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

import Bottle from 'bottlejs';
import data from './Data';
import dataValue from './DataValue';
import dataArray from './DataArray';
import dataMap from './DataMap';
import dataObject from './DataObject';

import map from './MapTo';
import filterTo from './FilterTo';
import modifier from './Modifier';
import reduceTo from './ReduceTo';
import types from './types';
import key from './Key';

export default () => {
  const b = new Bottle();
  data(b);
  dataValue(b);
  dataArray(b);
  dataMap(b);
  dataObject(b);
  map(b);
  modifier(b);
  filterTo(b);
  reduceTo(b);
  types(b);
  key(b);
  return b;
};

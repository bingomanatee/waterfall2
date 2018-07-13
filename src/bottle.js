import Bottle from 'bottlejs';
import data from './Data';
import map from './Map';
import filterTo from './FilterTo';
import modifier from './Modifier';
import reduceTo from './ReduceTo';
import types from './types';
import key from './Key';

export default () => {
  const b = new Bottle();
  data(b);
  map(b);
  modifier(b);
  filterTo(b);
  reduceTo(b);
  types(b);
  key(b);
  return b;
};

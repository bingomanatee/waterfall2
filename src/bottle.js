import Bottle from 'bottlejs';
import data from './Data';
import map from './Map';
import filterTo from './FilterTo';
import modifier from './Modifier';

export default () => {
  const bottle = new Bottle();
  data(bottle);
  map(bottle);
  modifier(bottle);
  filterTo(bottle);
  return bottle;
};

import Bottle from 'bottlejs';
import data from './Data';
import map from './Map';
import filterTo from './filterTo';

export default () => {
  const bottle = new Bottle();
  data(bottle);
  map(bottle);
  filterTo(bottle);
  return bottle;
};

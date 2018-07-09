import Bottle from 'bottlejs';
import data from './Data';
import map from './Map';

export default () => {
  const bottle = new Bottle();
  data(bottle);
  map(bottle);
  return bottle;
};

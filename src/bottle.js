import Bottle from 'bottlejs';
import data from './Data';

export default () => {
  const bottle = new Bottle();
  data(bottle);
  return bottle;
};

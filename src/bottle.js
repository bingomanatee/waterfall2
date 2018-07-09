import Bottle from 'bottlejs';
import data from './Data';
import map from './Map';
import callbackTo from './CallbackTo';
export default () => {
  const bottle = new Bottle();
  data(bottle);
  map(bottle);
  callbackTo(bottle);
  return bottle;
};

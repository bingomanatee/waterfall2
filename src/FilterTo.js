import { includes } from 'lodash';

/**
 * Callbacks are "Holistic" observers. Its central lever is a function that is called whenever
 * a Data instance changes.
 *
 * There is a primary Data that the callback checks, but it can be a funnel for multiple
 * Data objects, updating every time any one of them change.
 *
 * Callbacks work in one of two ways.
 *
 *  1) if there is NO "target" designated, its just a "change callback",
 *    triggered every time the Data (or a data in withData) changes;
 *    this is a good way to bridge information out of one Data object,
 *    or do other unions of several Data collections.
 *
 *  2) if there is a "target" and it is a Data, the result of the callback replaces
 *     the entire "target"'s contents.
 *
 *  3) if there is a "target" and it is a function, that function is called with the result
 *     of the callback  every time one of the watched Data changes. This is a good way to,
 *     for instance, replace a field of a Data collection with the result of an operation.
 *
 * @param b
 */
export default(b) => {
  b.factory('FilterTo', c => class FilterTo extends c.Modifier {
    /**
     * triggered whenever the "from" data or any of the "withs" changes.
     * it passes:
     * 1) the content of the from data
     * 2) the change (may be to from or any of the "with" data)
     * 3) an object of any data added to using the "with" method
     *
     * if there is a target, the result is
     * @param change
     */
    onChange(change) {
      const result = this.callback(this.from.content, change, this._withObj);
      if (this.target) {
        if (this.target instanceof c.Data) {
          this.target.replace(result);
        } else if (typeof this.target === 'function') {
          this.target(result, change, this);
        } else {
          throw new Error('strange target!');
        }
      }
    }
  });
};

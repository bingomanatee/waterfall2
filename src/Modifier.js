import { includes, flattenDeep, compact } from 'lodash';

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
 * note - the result of reduction is an instance of the same type as the target
 * @param b
 *
 */

export default(b) => {
  b.factory('Modifier', c => class ReduceTo {
    constructor(from, callback, target, ...withData) {
      this._withSet = new Set();
      this.target = target;
      this.from = from;
      this.callback = callback;
      this.withData = withData;
      this._inited = false;
    }

    get withData() {
      return Array.from(this._withSet.values());
    }

    get callback() {
      return this._callback;
    }

    set callback(value) {
      if (!value && typeof value === 'function') { throw new Error('callback must be a function'); }
      this._callback = value;
    }

    /**
     * note -- this is an additive method; it won't clear out old withs
     * just adds new ones.
     * @param withs
     */
    set withData(withs) {
      if (withs) {
        let withList;
        if (Array.isArray(withs)) {
          withList = withs;
        } else if (withs instanceof c.Data) {
          withList = [withs];
        } else {
          throw new Error('withs must be a Data instance or an array of them.');
        }
        compact(flattenDeep(withList)).forEach(data => this._addWith(data));
      }
    }

    get _withObj() {
      return Array.from(this._withSet.values()).reduce((memo, data) => {
        memo[data.name] = data.content;
        return memo;
      }, {});
    }

    _addWith(data) {
      if (!data && data instanceof c.Data) {
        throw new Error('withs must be a Data instance.');
      }
      if (this._withSet.has(data)) return;
      this._watch(data);
    }

    /**
     * watch links change in the parameter to trigger onChange.
     *
     * Both the primary (from) data collection and any "withs"
     * pass through `._watch`.
     *
     * @param data {c.Data}
     * @private
     */
    _watch(data) {
      if (!c.typeof(data) === 'Data') {
        throw new Error('watch targets must be a Data instance.');
      }

      if (this._withSet.has(data)) return;
      this._withSet.add(data);

      this._emitToData(data);
      data.outputs.add(this);
    }

    _emitToData(data) {
      if (!(c.typeof(data) === 'Data')) {
        console.log('bad watch: ', data);
        throw new Error('watch targets must be a Data instance.');
      }
      try {
        data.on('change', this.onChange, this);
      } catch (err) {
        console.log('bad watch: ', data, err);
      }
    }

    /**
     * the action that gets triggered on a change of from or a with Data.
     * note that when you manually initialize the modifier, there will be no change.
     * @param change
     */
    onChange(change) {
      throw new Error('must override');
    }

    init() {
      this._inited = true;
      if (this.target) this.onChange(null);
    }

    into(target, init = false) {
      this.target = target;
      if (init) this.init();
      return this;
    }

    toNew(type, name, initialize = false) {
      this.target = c.toData(c.blankOf(type), name);
      if (initialize) this.init();
      return this;
    }

    toNewArray(name, initialize = false) {
      return this.toNew(c.DATATYPE_ARRAY, name, initialize);
    }

    toNewMap(name, initialize = false) {
      return this.toNew(c.DATATYPE_MAP, name, initialize);
    }

    toNewObject(name, initialize = false) {
      return this.toNew(c.DATATYPE_OBJECT, name, initialize);
    }

    /**
     * a curried way to add a with after construction;
     * @param data
     * @returns {ReduceTo}
     */
    with(data) {
      this._addWith(data);
      return this;
    }

    get target() {
      return this._target;
    }

    /**
     * target is either
     * a Data instance (which is replaced on change)
     * OR a function that the result is passed to.
     *
     * @param target
     */
    set target(target) {
      if (target && !((typeof target === 'function') || (target instanceof c.Data))) {
        throw new Error('target must be instance of Data (or empty)');
      }
      this._target = target || null;
    }

    get from() {
      return this._from;
    }

    set from(data) {
      if (this._from) throw new Error('cannot change from');
      if (!(data instanceof c.Data)) throw new Error('from must be a Data instance');
      this._from = data;
      this._watch(data);
    }
  });
};

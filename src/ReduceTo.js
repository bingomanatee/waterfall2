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
 * note - the result of reduction is an instance of the same type as the target
 * @param b
 */
export default(b) => {
  b.factory('ReduceTo', c => class ReduceTo {
    constructor(from, callback, target, type, ...withData) {
      this._withMap = new Map();
      this._watchList = [];
      this.target = target;
      this.from = from;
      this.callback = callback;

      if (typeof target === 'function') {
        if (type instanceof c.Data) {
          throw new Error('ReduceTo requires a target type if target is a function');
        }
        this.targetType = type;
      } else if (type instanceof c.Data) {
        withData.unshift(type);
        this.targetType = this.target.type;
      }

      this.withData = withData;
    }

    get withData() {
      return this._withMap;
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
        withList.forEach(data => this._addWith(data));
      }
    }

    _addWith(data) {
      if (!data && data instanceof c.Data) {
        throw new Error('withs must be a Data instance.');
      }
      if (this._withMap.has(data.name)) return;
      this._withMap.set(data.name, data);
      this._watch(data);

      if (!this._withObj) {
        this._withObj = {};
      }
      this._withObj[data.name] = data.content;
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
      if (!data && data instanceof c.Data) {
        throw new Error('watch targets must be a Data instance.');
      }
      if (!includes(this._watchList, data.name)) {
        data.on('change', this.onChange, this);
        this._watchList.push(data.name);
      }
    }

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
      const result = this._reduce(this.from.content.values, change, this._withObj);
      if (this.target) {
        if (this.target instanceof c.Data) {
          this.target.content = result;
        } else if (typeof this.target === 'function') {
          this.target(result, change, this);
        } else {
          throw new Error('strange target!');
        }
      }
    }

    init() {
      return this.onChange(null);
    }

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
     * Unlike Filter, target cannot be falsy.
     *
     * @param target
     */
    set target(target) {
      if (!(target && ((typeof target === 'function') || (target instanceof c.Data)))) {
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

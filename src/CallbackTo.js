import { includes } from 'lodash';

export default(b) => {
  b.factory('CallbackTo', c => class CallbackTo {
    constructor(from, callback, {
      withData, target, targetKey,
    }) {
      this._withMap = new Map();
      this._watchList = [];
      this.target = target;
      this.targetKey = targetKey;
      this.withData = withData;
      this.from = from;

      this.watchData();
      this._callback = callback;
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
      this._withMap.set(data.name, data);
      this._watch(data);

      if (!this._withObj) {
        this._withObj = {};
      }
      this._withObj[data.name] = data.content;
    }

    _watch(data) {
      if (!data && data instanceof c.Data) {
        throw new Error('watch targets must be a Data instance.');
      }
      if (!includes(this._watchList, data.name)) {
        data.on('change', this.onChange);
        this._watchList.push(data.name);
      }
    }

    /**
     * triggered whenever the "from" data or any of the "withs" changes.
     * it passes:
     * 1) the content of the from data
     * 2) the change (may be to from or any of the "with" data)
     * 3) an object of any data atted to the "with" collection
     *
     * if there is a target, the result is
     * @param change
     */
    onChange(change) {
      const result = this.callback(this.from.content, change, this._withObj);
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
     * OR a function that the result is passed to,
     * OR a falsy value.
     *
     * @param target
     */
    set target(target) {
      if (target && (!((typeof target === 'function') || (target instanceof c.Data)))) {
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

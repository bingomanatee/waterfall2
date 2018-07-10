

export default(bottle) => {
  /**
   * MapTo establishes a relationship between two data objects
   * that copies filtered values from source to destination keys.
   */
  bottle.factory('MapTo', c => class MapTo extends c.Modifier {
    constructor(data, ...args) {
      if (data.type === c.DATATYPE_VALUE) throw new Error('cannot MapTo values');
      super(data, ...args);
    }

    onRemove({ change: { index, name } }) {
      if (!this.target) return;
      if (this.from.type === c.DATATYPE_ARRAY) {
        this.target.remove(index);
      } else this.target.remove(name);
    }

    onSplice({ change }) {
      if (!this.target) return;
      const { index, removedCount, added } = change;
      if (this.target.type === c.DATATYPE_ARRAY) {
        // should only get this messages on array to array actions
        const fAdded = [];
        added.forEach((value, key) => {
          fAdded.push(this.callback(value, key + index, this._withObj));
        });
        this.target.splice(index, removedCount, ...fAdded);
      } else {
        // there is no simple way to reconcile map splices to non-arrays;
        this.execute();
      }
    }

    _watchData(data) {
      if (data.name === this.from.name) {
        data.on('remove', this.onRemove, this);
        data.on('splice', this.onSplice, this);
        data.on('add', this.onSet, this);
        data.on('update', this.onSet, this);
      } else {
        super._watchData(data);
      }
    }

    onSet({ change: { index, name, newValue } }) {
      if (!this.target) return;
      const key = this.from.type === c.DATATYPE_ARRAY ? index : name;
      const value = this.callback(newValue, key);
      this.target.set(key, value);
    }

    /**
     * map all thje values
     */
    map() {
      if (!this.target) return;
      let newTarget = this.getEmptyTo();

      switch (this.target.type) {
        case c.DATATYPE_ARRAY:
          newTarget = this.from.values.map((value, key) => {
            const result = this.callback(value, key, this._withObj);
            return result;
          });
          break;

        case c.DATATYPE_OBJECT:
          this.from.entries.forEach(([key, value]) => {
            newTarget[key] = this.callback(value, key, this._withObj);
          });
          break;

        case c.DATATYPE_MAP:
          this.from.entries.forEach(([key, value]) => {
            const newValue = this.callback(value, key, this._withObj);
            return newTarget.set(key, newValue);
          });
          break;

        default:
          throw new Error('unhandled type');
      }

      this.target.content = newTarget;
    }

    getEmptyTo() {
      let out;
      switch (this.target.type) {
        case c.DATATYPE_ARRAY:
          out = [];
          break;

        case c.DATATYPE_OBJECT:
          out = {};
          break;

        case c.DATATYPE_MAP:
          out = new Map();
          break;

        case c.DATATYPE_VALUE:
          out = null;
          break;

        default:
          throw new Error('unhandled type');
      }
      return out;
    }

    init() {
      this.map();
    }

    execute() {
      this.map();
    }
  });
};

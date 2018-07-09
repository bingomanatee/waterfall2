

export default(bottle) => {
  /**
   * MapTo establishes a relationship between two data objects
   * that copies filtered values from source to destination keys.
   */
  bottle.factory('MapTo', c => class MapTo {
    constructor(data, filter, target) {
      if (data.type === c.DATATYPE_VALUE) throw new Error('cannot MapTo values');
      this.data = data;
      this.filter = filter;
      this.watchData();

      if (target) {
        this.target = target;
      }
    }

    get target() {
      return this._target;
    }

    set target(value) {
      if (this._target) {
        throw new Error('cannot re-set MapTo Target');
      } else {
        this._target = value;
        this.init();
      }
    }

    watchData() {
      this.data.on('remove', ({ data, change: { index, name } }) => {
        if (!this.target) return;
        if (this.data.type === c.DATATYPE_ARRAY) {
          this.target.remove(index);
        } else this.target.remove(name);
      });
      this.data.on('splice', ({ change }) => {
        if (!this.target) return;
        const { index, removedCount, added } = change;
        if (this.target.type === c.DATATYPE_ARRAY) {
          // should only get this messages on array to array actions
          const fAdded = [];
          added.forEach((value, key) => {
            fAdded.push(this.filter(value, key + index));
          });
          this.target.splice(index, removedCount, ...fAdded);
        } else {
          // there is no simple way to reconcile map splices to non-arrays;
          this.setAll();
        }
      });
      this.data.on('add', ({ change }) => this.onSet(change));
      this.data.on('update', ({ change }) => this.onSet(change));
    }

    onSet({ index, name, newValue }) {
      if (!this.target) return;
      const key = this.data.type === c.DATATYPE_ARRAY ? index : name;
      const value = this.filter(newValue, key);
      this.target.set(key, value);
    }

    setAll() {
      if (!this.target) return;
      let newTarget = this.getEmptyTo();

      switch (this.target.type) {
        case c.DATATYPE_ARRAY:
          newTarget = this.data.values.map(this.filter);
          break;

        case c.DATATYPE_OBJECT:
          this.data.entries.forEach(([key, value]) => newTarget[key] = this.filter(value, key));
          break;

        case c.DATATYPE_MAP:
          this.data.entries.forEach(([key, value]) => {
            const newValue = this.filter(value, key);
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
      this.setAll();
    }
  });
};

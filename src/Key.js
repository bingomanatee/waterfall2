

export default(bottle) => {
  /**
   * This is a reverse of MapTo = it stores values in the target (unchanged)
   * by a key determined by the callback. The assumption here is that
   * (a) the result of key should not change once determined, and
   * (b) the result of key souuld be unique across the domain.
   */
  bottle.factory('Key', c => class KeyTo extends c.Modifier {
    constructor(data, callback, target) {
      if (!(target && c.typeof(target) === 'Data')) {
        throw new Error('must have a data target');
      }
      super(data, callback, target);
    }

    onRemove({ change }) {
      const { index, name } = change;
      const key = (this.from.type === c.DATATYPE_ARRAY) ? index : name;
      const value = this.from.get(key);
      this.target.remove(this.callback(value, key, change, this));
    }

    onSplice({ change }) {
      if (!this.target) return;
      const {
        added, removed,
      } = change;
      if (this.target.type === c.DATATYPE_ARRAY) {
        // should only get this messages on array to array actions
        removed.forEach((value, key) => {
          const targetKey = this.callback(value, key, change, this);
          this.target.remove(targetKey);
        });
        added.forEach((value, key) => {
          const targetKey = this.callback(value, key, change, this);
          this.target.set(targetKey, value);
        });
      } else {
        // there is no simple way to reconcile map splices to non-arrays;
        this.execute();
      }
    }

    _watchData(data) {
      if (data.name === this.from.name) {
        data.on('replace', this.onSet, this);
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
      const newTarget = this.getEmptyTo();

      switch (this.target.type) {
        case c.DATATYPE_ARRAY:
          this.from.values.map((value, key) => {
            const newKey = this.callback(value, key, this._withObj);
            newTarget[newKey] = value;
            return newKey;
          });
          break;

        case c.DATATYPE_OBJECT:
          this.from.entries.forEach(([key, value]) => {
            const newKey = this.callback(value, key, this._withObj);
            newTarget[newKey] = value;
          });
          break;

        case c.DATATYPE_MAP:
          this.from.entries.forEach(([key, value]) => {
            const newKey = this.callback(value, key, this._withObj);
            newTarget.set(newKey, value);
          });
          break;

        default:
          throw new Error('unhandled type');
      }

      this.target.replace(newTarget);
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

import { cloneDeep } from 'lodash';

export default (bottle) => {
  bottle.factory('DataMap', c => class DataMap extends c.Data {
    get type() {
      return c.DATATYPE_MAP;
    }

    raw() {
      const myEntries = this.entries.map(([key, value]) => [key, cloneDeep(value)]);
      return new Map(myEntries);
    }

    get(name) {
      if (this._activeTrans) {
        return this._activeTrans.newContent.get(name);
      }
      return this.content.get(name);
    }

    get size() {
      return this.content.size;
    }

    get keys() {
      return Array.from(this.content.keys());
    }

    get values() {
      return Array.from(this.content.values());
    }

    cloneData(map) {
      return new Map(map);
    }

    set(name, value) {
      if (typeof name === 'undefined') throw new Error('cannot set undefined', name);
      if (this.has(name)) {
        const oldValue = this.get(name);
        if (this._activeTrans) {
          this._activeTrans.newContent.set(name, value);
        } else { this.content.set(name, value); }
        this.onChange({
          type: 'update',
          name,
          oldValue,
          newValue: value,
        });
      } else {
        if (this._activeTrans) {
          this._activeTrans.newContent.set(name, value);
        } else { this.content.set(name, value); }
        this.onChange({
          type: 'add',
          name,
          newValue: value,
        });
      }
    }

    has(index) {
      return this.content.has(index);
    }

    remove(key) {
      if (!this.has(key)) return;
      const oldValue = this.get(key);
      this.content.delete(key);
      this.onChange({ type: 'remove', name: key, oldValue });
    }
  });
};

import { cloneDeep, first, last } from 'lodash';

module.exports = (bottle) => {
  bottle.factory('DataArray', c => class DataMap extends c.Data {
    get type() {
      return c.DATATYPE_ARRAY;
    }

    splice(index, removedCount, ...added) {
      const addedCount = added.length;

      const removed = this.content.splice(index, removedCount, ...added);
      this.onChange({
        type: 'splice', index, added, removed, addedCount, removedCount,
      });
      return removed;
    }
    slice(...args) { return this.content.slice(...args); }
    push(...added) {
      this.splice(this.content.length, 0, ...added);
    }
    pop() {
      if (!this.length) return null;
      const result = last(this.content);
      this.splice(this.length - 1, 1);
      return result;
    }
    unshift(...added) {
      return this.splice(0, 0, ...added);
    }
    get length() {
      return this.content.length;
    }

    get size() {
      return this.length;
    }

    cloneData(array) {
      return array.slice(0);
    }

    shift() {
      if (!this.length) return null;
      const out = first(this.content);
      this.splice(0, 1);
      return out;
    }

    remove(key) {
      return this.splice(key, 1);
    }

    onChange(change) {
      switch (change.type) {
        case 'splice':
          this.emit('change', { data: this.name, change });
          this.onSplice(change);
          break;

        default:
          super.onChange(change);
      }
    }

    raw() {
      return this.content.map(cloneDeep);
    }

    map(fn) {
      return this.content.map(fn);
    }

    set(index, value) {
      for (let i = this.length; i < index; ++i) {
        super.set(i);
      }
      super.set(index, value);
    }

    onSplice(change) {
      this.emit('splice', { data: this.name, change });
    }
    get keys() {
      return Array.from(this.content.keys());
    }

    get values() {
      return this.content.slice(0);
    }

    has(index) {
      return index === Math.round(index) && index >= 0 && index < this.content.length;
    }
  });
};

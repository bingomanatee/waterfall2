import { difference, cloneDeep, includes, first, last } from 'lodash';
import EventEmitter from 'eventemitter3';

const KNOWN_TYPES = 'add,remove,delete,replace,change,update'.split(',');

export default (bottle) => {
  /**
   * the base class for Data variations
   */

  bottle.factory('Data', (c) => {
    class Data extends EventEmitter {
      constructor(content, name) {
        super();
        this.content = content;
        this.name = name || `data_${++Data._nextID}`;
      }

      mapTo(...args) {
        return new c.MapTo(this, ...args);
      }

      key(...args) {
        return new c.Key(this, ...args);
      }

      filterTo(...args) {
        return new c.FilterTo(this, ...args);
      }

      reduceTo(...args) {
        return new c.ReduceTo(this, ...args);
      }

      get entries() {
        return Array.from(this.content.entries());
      }

      set content(value) {
        this._content = value;
        this.onChange({ type: 'replace', content: value });
      }

      raw() {
        return cloneDeep(this.content);
      }

      get content() {
        return this._content;
      }

      replace(value) {
        const valueType = c.dataType(value);
        if (this.type !== valueType) {
          throw new Error(`attempt to replace in ${this.name} a ${this.type.toString()} with content of type ${valueType.toString()}`);
        }
        this.content = value;
      }

      remove(key) {
        throw new Error('override');
      }

      get values() {
        throw new Error('override');
      }

      get keys() {
        throw new Error('override');
      }

      has(index) {
        throw new Error('override');
      }

      get(index) {
        return this.content[index];
      }

      set(name, value) {
        if (this.has(name)) {
          const oldValue = this.get(name);
          this.content[name] = value;
          this.onChange({
            type: 'update', name, index: name, oldValue, newValue: value,
          });
        } else {
          this.content[name] = value;
          this.onChange({
            type: 'add', name, index: name, newValue: value,
          });
        }
      }

      get type() {
        throw new Error('must override');
      }

      onChange(change) {
        this._sendChange(change);
      }

      _sendChange(change) {
        this.emit('change', { data: this.name, change });

        this.emit(change.type, { data: this.name, change });

        // eslint-disable-next-line default-case
        switch (change.type) {
          case 'delete':
            this.emit('remove', { data: this.name, change });
            break;

          case 'remove':
            this.emit('delete', { data: this.name, change });
            break;
        }

        if (!includes(KNOWN_TYPES, change.type)) {
          this.emit('change-other', { data: this.name, change });
        }
      }
    }
    Data._nextID = 0;

    return Data;
  });

  bottle.factory('DataMap', c => class DataMap extends c.Data {
    get type() {
      return c.DATATYPE_MAP;
    }

    raw() {
      const myEntries = this.entries.map(([key, value]) => [key, cloneDeep(value)]);
      return new Map(myEntries);
    }

    get(name) {
      return this.content.get(name);
    }

    get keys() {
      return this.content.keys();
    }

    get values() {
      return this.content.values();
    }

    set(name, value) {
      if (typeof name === 'undefined') throw new Error('cannot set undefined', name);
      if (this.has(name)) {
        const oldValue = this.get(name);
        this.content.set(name, value);
        this.onChange({
          type: 'update',
          name,
          oldValue,
          newValue: value,
        });
      } else {
        this.content.set(name, value);
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

  bottle.factory('DataObject', c => class DataObject extends c.Data {
    get type() {
      return c.DATATYPE_OBJECT;
    }

    replace(value) {
      const valueKeys = Object.keys(value);
      const deletedKeys = difference(this.keys, valueKeys);
      deletedKeys.forEach(key => this.remove(key));
      valueKeys.forEach(key => this.set(key, value[key]));
    }

    raw() {
      return this.entries.reduce((out, pair) => {
        out[pair[0]] = (pair && (typeof pair[1] === 'object')) ? cloneDeep(pair[1]) : pair[1];
        return out;
      }, {});
    }
    get keys() {
      return Object.keys(this.content);
    }

    get values() {
      return Object.values(this.content);
    }

    get entries() {
      return Object.entries(this.content);
    }

    remove(key) {
      if (!this.has(key)) return;
      const oldValue = this.content[key];
      delete this.content[key];
      this.onChange({ type: 'remove', name: key, oldValue });
    }

    has(index) {
      // eslint-disable-next-line no-prototype-builtins
      return this.content.hasOwnProperty(index);
    }
  });

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
      return this.content.keys;
    }

    get values() {
      return this.content.slice(0);
    }

    has(index) {
      return index === Math.round(index) && index >= 0 && index < this.content.length;
    }
  });

  bottle.factory('DataValue', c => class DataMap extends c.Data {
    set(index, value) {
      throw new Error('cannot set a DataValue');
    }
    get type() {
      return c.DATATYPE_VALUE;
    }

    set content(newValue) {
      const oldValue = this._content || null;
      this._content = newValue;
      this.emit('change', {
        data: this.name,
        change: {
          oldValue,
          newValue,
        },
      });
      this.emit('update', {
        data: this.name,
        change: {
          oldValue,
          newValue,
        },
      });
    }

    get content() {
      return this._content;
    }

    replace(value) {
      this.content = value;
    }

    raw() {
      if (this.content && typeof this.content === 'object') return cloneDeep(this.content);
      return this.content;
    }
  });

  bottle.factory('dataType', c => (item) => {
    if (item === null) return c.DATATYPE_VALUE;
    if (Array.isArray(item)) return c.DATATYPE_ARRAY;
    if (item instanceof Map) return c.DATATYPE_MAP;
    if (typeof item === 'object') return c.DATATYPE_OBJECT;
    return c.DATATYPE_VALUE;
  });

  bottle.factory('toData', c => (content, name = null) => {
    const type = c.dataType(content);
    let out;
    switch (type) {
      case c.DATATYPE_MAP:
        out = new c.DataMap(content, name);
        break;

      case c.DATATYPE_OBJECT:
        out = new c.DataObject(content, name);
        break;

      case c.DATATYPE_ARRAY:
        out = new c.DataArray(content, name);
        break;

      case c.DATATYPE_VALUE:
        out = new c.DataValue(content, name);
        break;

      default:
        throw new Error(`unhandled type, ${type}`);
    }
    return out;
  });
};

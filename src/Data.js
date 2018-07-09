import { observable, observe, entries, remove, values, keys, get, set } from 'mobx';
import EventEmitter from 'eventemitter3';
import { difference, cloneDeep } from 'lodash';

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

      callbackTo(...args) {
        return new c.CallbackTo(this, ...args);
      }

      set content(value) {
        if (!value) throw new Error('content value not present');
        if (this._content) {
          this.replace(value);
        } else {
          this._content = observable(value);
          try {
            this.immediate = true;
            this._contentOb = observe(this._content, change => this.onChange(change), {}, true);
          } catch (err) {
            this.immediate = false;
            if (/(doesn't support the fire immediately property for observable objects)|(doesn't support fireImmediately=true in combination with maps)/
              .test(err.message)) {
              // eslint-disable-next-line max-len
              this._contentOb = observe(this._content, change => this.onChange(change), {}, { deep: false });
            } else {
              throw err;
            }
          }
        }
      }

      raw() {
        return cloneDeep(this.content);
      }

      get content() {
        return this._content;
      }

      /**
       * mobx object API methods
       * @param value
       */
      replace(value) {
        const valueType = c.dataType(value);
        if (this.type !== valueType) {
          throw new Error(`attempt to replace a ${this.type} with content of type ${valueType}`);
        }
        this.content.replace(value);
      }

      remove(key) {
        remove(this.content, key);
      }

      get values() {
        return values(this.content);
      }

      get keys() {
        return keys(this.content);
      }

      get entries() {
        return entries(this.content);
      }

      get(index) {
        return get(this.content, index);
      }

      set(index, value) {
        return set(this.content, index, value);
      }

      get type() {
        throw new Error('must override');
      }

      onChange(change) {
        this.emit('change', { data: this.name, change });

        switch (change.type) {
          case 'update':
            this.emit('update', { data: this.name, change });
            break;

          case 'add':
            this.emit('add', { data: this.name, change });
            break;

          case 'delete':
            this.emit('delete', { data: this.name, change });
            this.emit('remove', { data: this.name, change });
            break;

          case 'remove':
            this.emit('remove', { data: this.name, change });
            break;

          default:
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
  });

  bottle.factory('DataArray', c => class DataMap extends c.Data {
    get type() {
      return c.DATATYPE_ARRAY;
    }

    splice(...args) {
      this.content.splice(...args);
    }

    remove(key) {
      this.content.splice(key, 1);
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

    onSplice(change) {
      this.emit('splice', { data: this.name, change });
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

  bottle.constant('DATATYPE_MAP', Symbol('DATATYPE_MAP'));
  bottle.constant('DATATYPE_OBJECT', Symbol('DATATYPE_OBJECT'));
  bottle.constant('DATATYPE_ARRAY', Symbol('DATATYPE_ARRAY'));
  bottle.constant('DATATYPE_VALUE', Symbol('DATATYPE_VALUE'));

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

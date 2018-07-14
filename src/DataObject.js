import { cloneDeep, difference } from 'lodash';

export default (bottle) => {
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
    get size() {
      return this.values.length;
    }

    cloneData(data) {
      return Object.assign({}, data);
    }

    raw() {
      return this.entries.reduce((out, pair) => {
        out[pair[0]] = (pair && (typeof pair[1] === 'object')) ? cloneDeep(pair[1]) : pair[1];
        return out;
      }, {});
    }
    get keys() {
      return Array.from(Object.keys(this.content));
    }

    get values() {
      return Array.from(Object.values(this.content));
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
};

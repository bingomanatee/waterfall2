import { cloneDeep } from 'lodash';

export default (bottle) => {
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
      this.onChange({
        type: 'replace',
        oldValue,
        newValue,
      });
    }

    cloneData(item) {
      return item;
    }

    get size() {
      return 1;
    }

    get content() {
      return this._content;
    }

    replace(value) {
      this.content = value;
    }

    _mainTable() {
      return `value: ${this.content}`;
    }

    raw() {
      if (this.content && typeof this.content === 'object') return cloneDeep(this.content);
      return this.content;
    }
  });
};

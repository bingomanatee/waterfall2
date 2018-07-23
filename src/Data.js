/* eslint-disable no-restricted-syntax */
import { difference, cloneDeep, includes, first, last, zip, isEqual } from 'lodash';
import textTable from 'text-table';
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
        this._currentTransaction = null;
      }

      transStart() {
        if (this._currentTransaction) {
          this._currentTransaction.close();
        }
        this._currentTransaction = new c.Transaction(this);
      }

      get _activeTrans() {
        if (this._currentTransaction && this._currentTransaction.state === 'open') { return this._currentTransaction; }
        return false;
      }

      get hasTrans() {
        return !!this._activeTrans;
      }

      transEnd() {
        if (this._currentTransaction) {
          this._currentTransaction.close();
          this._currentTransaction = null;
        }
      }

      transRevert() {
        this._currentTransaction = null;
      }

      map(fn) {
        return this.keys.map(key => fn(this.get(key), key));
      }

      mapTo(...args) {
        return new c.MapTo(this, ...args);
      }

      get inputs() {
        if (!this._inputs) { this._inputs = new Set(); }
        return this._inputs;
      }

      get outputs() {
        if (!this._outputs) { this._outputs = new Set(); }
        return this._outputs;
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

      cloneData(value) {
        return cloneDeep(value);
      }

      equal(value) {
        return isEqual(value, this.content);
      }

      set content(value) {
        if (this._content) {
          const vType = c.dataType(value);
          if (vType !== this.type) throw new Error(`cannot replace  ${this.type.toString()} with type ${vType.toString()}`);
          if (this.equal(value)) { return; }
        }

        value = this.cloneData(value);

        if (this._activeTrans) {
          this._activeTrans.newData = value;
          this._activeTrans.replace = true;
          return;
        }

        this._content = value;
        this.sendReplace();
      }

      sendReplace() {
        this.onChange({ type: 'replace', content: this.content });
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
          if (isEqual(value, oldValue)) return;

          if (this._activeTrans) {
            this._activeTrans.newContent[name] = value;
          } else { this.content[name] = value; }
          this.onChange({
            type: 'update', name, index: name, oldValue, newValue: value,
          });
        } else {
          if (this._activeTrans) {
            this._activeTrans.newContent[name] = value;
          } else { this.content[name] = value; }
          this.onChange({
            type: 'add', name, index: name, newValue: value,
          });
        }
      }

      get type() {
        throw new Error('must override');
      }

      get typeName() {
        const str = this.type.toString();
        return (/\(([^[\)\(]*)\)/.exec(str)[1]);
      }

      onChange(change) {
        this._sendChange(change);
      }

      _sendChange(change) {
        if (this._activeTrans) {
          this._activeTrans.addChange(change);
          return;
        }

        change = cloneDeep(change);

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

      _mainTable({
        isHorizontal = true, maxItems = null, cellRenderer = null, alignValue = 'l',
      }) {
        const data = [];
        let keys = this.keys;
        if (maxItems) keys = keys.slice(0, maxItems);
        let values = this.values;
        if (!values) {
          console.log('cant get values for ', this.name);
          values = [];
        }
        if (cellRenderer) values = this.map(cellRenderer);
        if (maxItems) values = values.slice(0, maxItems);
        let align = ['l'];
        if (isHorizontal) {
          data.push(['key', ...keys]);
          data.push(['value', ...values]);
          if (typeof alignValue === 'function') {
            align = this.map(alignValue);
            data.push(['l', ...align]);
          } else {
            values.forEach(() => align.push(alignValue));
          }
        } else {
          data.push(['key', 'value']);
          const rows = zip(keys, values);
          data.push(...rows);
          if (Array.isArray(alignValue)) {
            align = align.concat(alignValue);
          } else align.push(alignValue, alignValue);
        }

        return textTable(data, { align, hsep: '|' });
      }

      _outTable() {
        const outData = [['method', 'target', 'from', 'with']];
        const otherWiths = (item) => {
          const names = item.withData.map(data => (data ? data.name : ''));
          const main = [item.from.name];
          return difference(names, main).join(', ');
        };
        for (const item of this.outputs) {
          outData.push([
            item.modifierType,
            item.target ? item.target.name : '(none)',
            item.from.name,
            otherWiths(item),
          ]);
        }

        return textTable(outData, { align: ['l', 'l'] });
      }

      toTable(config = {}) {
        let mainTable = '--- error ---';

        try {
          mainTable = this._mainTable(config);
        } catch (err) {
          mainTable = `Error on mainTable: ${err.message}`;
          console.log('mainTable Error:', err);
        }

        let outTable = '(no outputs)';
        if (this.outputs.size > 0) {
          try {
            outTable = this._outTable(config);
          } catch (err) {
            outTable = `Error on outTable: ${err.message}`;
            console.log('outTable Error:', err);
          }
        }

        let count = `(${this.size})`;
        if (config.maxItems < this.size) {
          count = `(${config.maxItems} of ${this.size})`;
        }

        return `
____________________________________________
DATA: ${this.name}:${this.typeName} ${count}
${mainTable}

outputs:
        
${outTable}
-------------------------------------------`;
      }
    }
    Data._nextID = 0;

    return Data;
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

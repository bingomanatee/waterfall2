const waterfall =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// EXTERNAL MODULE: external "bottlejs"
var external__bottlejs_ = __webpack_require__(3);
var external__bottlejs__default = /*#__PURE__*/__webpack_require__.n(external__bottlejs_);

// EXTERNAL MODULE: external "lodash"
var external__lodash_ = __webpack_require__(0);
var external__lodash__default = /*#__PURE__*/__webpack_require__.n(external__lodash_);

// EXTERNAL MODULE: external "text-table"
var external__text_table_ = __webpack_require__(4);
var external__text_table__default = /*#__PURE__*/__webpack_require__.n(external__text_table_);

// EXTERNAL MODULE: external "eventemitter3"
var external__eventemitter3_ = __webpack_require__(5);
var external__eventemitter3__default = /*#__PURE__*/__webpack_require__.n(external__eventemitter3_);

// CONCATENATED MODULE: ./src/Data.js
/* eslint-disable no-restricted-syntax,no-useless-escape */




const KNOWN_TYPES = 'add,remove,delete,replace,change,update'.split(',');

/* harmony default export */ var src_Data = (bottle => {
  /**
   * the base class for Data variations
   */

  bottle.factory('Data', c => {
    class Data extends external__eventemitter3__default.a {
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
        if (this._currentTransaction && this._currentTransaction.state === 'open') {
          return this._currentTransaction;
        }
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
        if (!this._inputs) {
          this._inputs = new Set();
        }
        return this._inputs;
      }

      get outputs() {
        if (!this._outputs) {
          this._outputs = new Set();
        }
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
        return Object(external__lodash_["cloneDeep"])(value);
      }

      equal(value) {
        return Object(external__lodash_["isEqual"])(value, this.content);
      }

      set content(value) {
        if (this._content) {
          const vType = c.dataType(value);
          if (vType !== this.type) throw new Error(`cannot replace  ${this.type.toString()} with type ${vType.toString()}`);
          if (this.equal(value)) {
            return;
          }
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
        return Object(external__lodash_["cloneDeep"])(this.content);
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
          if (Object(external__lodash_["isEqual"])(value, oldValue)) return;

          if (this._activeTrans) {
            this._activeTrans.newContent[name] = value;
          } else {
            this.content[name] = value;
          }
          this.onChange({
            type: 'update', name, index: name, oldValue, newValue: value
          });
        } else {
          if (this._activeTrans) {
            this._activeTrans.newContent[name] = value;
          } else {
            this.content[name] = value;
          }
          this.onChange({
            type: 'add', name, index: name, newValue: value
          });
        }
      }

      get type() {
        throw new Error('must override');
      }

      get typeName() {
        const str = this.type.toString();
        return (/\(([^[)(]*)\)/.exec(str)[1]
        );
      }

      onChange(change) {
        this._sendChange(change);
      }

      _sendChange(change) {
        if (this._activeTrans) {
          this._activeTrans.addChange(change);
          return;
        }

        change = Object(external__lodash_["cloneDeep"])(change);

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

        if (!Object(external__lodash_["includes"])(KNOWN_TYPES, change.type)) {
          this.emit('change-other', { data: this.name, change });
        }
      }

      _mainTable({
        isHorizontal = true, maxItems = null, cellRenderer = null, alignValue = 'l'
      }) {
        const data = [];
        // eslint-disable-next-line prefer-destructuring
        let keys = this.keys;
        if (maxItems) keys = keys.slice(0, maxItems);
        // eslint-disable-next-line prefer-destructuring
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
          const rows = Object(external__lodash_["zip"])(keys, values);
          data.push(...rows);
          if (Array.isArray(alignValue)) {
            align = align.concat(alignValue);
          } else align.push(alignValue, alignValue);
        }

        return external__text_table__default()(data, { align, hsep: '|' });
      }

      _outTable() {
        const outData = [['method', 'target', 'from', 'with']];
        const otherWiths = item => {
          const names = item.withData.map(data => data ? data.name : '');
          const main = [item.from.name];
          return Object(external__lodash_["difference"])(names, main).join(', ');
        };
        for (const item of this.outputs) {
          outData.push([item.modifierType, item.target ? item.target.name : '(none)', item.from.name, otherWiths(item)]);
        }

        return external__text_table__default()(outData, { align: ['l', 'l'] });
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
});
// CONCATENATED MODULE: ./src/DataValue.js


/* harmony default export */ var DataValue = (bottle => {
  bottle.factory('DataValue', c => class DataMap extends c.Data {
    set(index, value) {
      throw new Error('cannot set a DataValue');
    }
    get type() {
      return c.DATATYPE_VALUE;
    }

    set content(newValue) {
      const oldValue = this._content || null;
      if (Object(external__lodash_["isEqual"])(this._content, newValue)) return;
      this._content = newValue;
      this.onChange({
        type: 'replace',
        oldValue,
        newValue
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
      if (this.content && typeof this.content === 'object') return Object(external__lodash_["cloneDeep"])(this.content);
      return this.content;
    }
  });
});
// CONCATENATED MODULE: ./src/DataArray.js


/* harmony default export */ var DataArray = (bottle => {
  bottle.factory('DataArray', c => class DataMap extends c.Data {
    get type() {
      return c.DATATYPE_ARRAY;
    }

    splice(index, removedCount, ...added) {
      const addedCount = added.length;

      const removed = this.content.splice(index, removedCount, ...added);
      this.onChange({
        type: 'splice', index, added, removed, addedCount, removedCount
      });
      return removed;
    }
    slice(...args) {
      return this.content.slice(...args);
    }
    push(...added) {
      this.splice(this.content.length, 0, ...added);
    }
    pop() {
      if (!this.length) return null;
      const result = Object(external__lodash_["last"])(this.content);
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

    equal(value) {
      if (value.length !== this.length) return false;
      return super.equal(value);
    }

    shift() {
      if (!this.length) return null;
      const out = Object(external__lodash_["first"])(this.content);
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
});
// CONCATENATED MODULE: ./src/DataMap.js


/* harmony default export */ var src_DataMap = (bottle => {
  bottle.factory('DataMap', c => class DataMap extends c.Data {
    get type() {
      return c.DATATYPE_MAP;
    }

    raw() {
      const myEntries = this.entries.map(([key, value]) => [key, Object(external__lodash_["cloneDeep"])(value)]);
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

    equal(value) {
      if (this.size !== value.size) return false;
      return super.equal(value);
    }

    set(name, value) {
      if (typeof name === 'undefined') throw new Error('cannot set undefined', name);
      if (this.has(name)) {
        const oldValue = this.get(name);
        if (Object(external__lodash_["isEqual"])(value, oldValue)) {
          return;
        }
        if (this._activeTrans) {
          this._activeTrans.newContent.set(name, value);
        } else {
          this.content.set(name, value);
        }
        this.onChange({
          type: 'update',
          name,
          oldValue,
          newValue: value
        });
      } else {
        if (this._activeTrans) {
          this._activeTrans.newContent.set(name, value);
        } else {
          this.content.set(name, value);
        }
        this.onChange({
          type: 'add',
          name,
          newValue: value
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
});
// CONCATENATED MODULE: ./src/DataObject.js


/* harmony default export */ var src_DataObject = (bottle => {
  bottle.factory('DataObject', c => class DataObject extends c.Data {
    get type() {
      return c.DATATYPE_OBJECT;
    }

    replace(value) {
      const valueKeys = Object.keys(value);
      const deletedKeys = Object(external__lodash_["difference"])(this.keys, valueKeys);
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
        out[pair[0]] = pair && typeof pair[1] === 'object' ? Object(external__lodash_["cloneDeep"])(pair[1]) : pair[1];
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
});
// CONCATENATED MODULE: ./src/Transaction.js
/* harmony default export */ var Transaction = (bottle => {
  bottle.constant('Transaction', class Transaction {
    constructor(data) {
      this.data = data;
      this.changes = [];
      this._replace = false;
      this.newContent = this.data.raw();
      this.state = 'open';
    }

    get replace() {
      return this._replace;
    }

    set replace(value) {
      this._replace = !!value;
    }

    revert() {
      this.state = 'reverted';
    }

    close() {
      if (this.state !== 'open') return;
      if (this.replace) {
        this.state = 'closed';
        this.data.sendReplace();
      } else {
        const oldValues = this.changes.reduce((values, change) => {
          // eslint-disable-next-line default-case
          switch (change.type) {
            case 'set':
              values.set(change.name, this.data.get(change.name));
          }
          return values;
        }, new Map());

        const newValues = this.changes.reduce((values, change) => {
          // eslint-disable-next-line default-case
          switch (change.type) {
            case 'add':
              values.set(change.name, change.value);
              break;

            case 'set':
              values.set(change.name, change.value);
              oldValues.set(change.name, this.data.get(change.name));
          }

          return values;
        }, new Map());
        this.data._content = this.newContent;
        this.state = 'closed';
        this.data.onChange({
          type: 'batch',
          oldValues,
          newValues
        });
      }
    }

    addChange(change) {
      if (this.replace) return;

      switch (change.type) {
        case 'splice':
          this.replace = true;
          break;

        case 'delete':
          this.replace = true;
          break;

        case 'replace':
          this.replace = true;
          break;

        default:
          this.changes.push(change);
      }
    }
  });
});
// CONCATENATED MODULE: ./src/MapTo.js


/* harmony default export */ var MapTo = (bottle => {
  /**
   * MapTo establishes a relationship between two data objects
   * that copies filtered values from source to destination keys.
   */
  bottle.factory('MapTo', c => class MapTo extends c.Modifier {
    constructor(data, ...args) {
      if (data.type === c.DATATYPE_VALUE) throw new Error('cannot MapTo values');
      super(data, ...args);
    }

    get modifierType() {
      return 'MapTo';
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

    _emitToData(data) {
      if (data.name === this.from.name) {
        data.on('remove', this.onRemove, this);
        data.on('splice', this.onSplice, this);
        data.on('replace', this.map, this);
        data.on('add', this.onSet, this);
        data.on('update', this.onSet, this);
      } else {
        super._emitToData(data);
      }
    }

    onSet({ target, change }) {
      const { index, name, newValue } = change;
      if (!this.target) return;
      const key = this.from.type === c.DATATYPE_ARRAY ? index : name;
      try {
        const value = this.callback(newValue, key);
        this.target.set(key, value);
      } catch (err) {
        console.log('failed on change: ', target, change);
      }
    }

    onChange() {
      if (!this._inited) return;
      this.map();
    }

    /**
     * map all thje values
     */
    map() {
      if (!this.target) return;
      let newTarget = this.getEmptyTo();
      const withObj = this._withObj;
      switch (this.target.type) {
        case c.DATATYPE_ARRAY:
          newTarget = this.from.values.map((value, key) => {
            const result = this.callback(value, key, withObj);
            return result;
          });
          break;

        case c.DATATYPE_OBJECT:
          this.from.entries.forEach(([key, value]) => {
            newTarget[key] = this.callback(value, key, withObj);
          });
          break;

        case c.DATATYPE_MAP:
          this.from.entries.forEach(([key, value]) => {
            const newValue = this.callback(value, key, withObj);
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
});
// CONCATENATED MODULE: ./src/FilterTo.js


/**
 * Callbacks are "Holistic" observers. Its central lever is a function that is called whenever
 * a Data instance changes.
 *
 * There is a primary Data that the callback checks, but it can be a funnel for multiple
 * Data objects, updating every time any one of them change.
 *
 * Callbacks work in one of two ways.
 *
 *  1) if there is NO "target" designated, its just a "change callback",
 *    triggered every time the Data (or a data in withData) changes;
 *    this is a good way to bridge information out of one Data object,
 *    or do other unions of several Data collections.
 *
 *  2) if there is a "target" and it is a Data, the result of the callback replaces
 *     the entire "target"'s contents.
 *
 *  3) if there is a "target" and it is a function, that function is called with the result
 *     of the callback  every time one of the watched Data changes. This is a good way to,
 *     for instance, replace a field of a Data collection with the result of an operation.
 *
 * @param b
 */
/* harmony default export */ var FilterTo = (b => {
  b.factory('FilterTo', c => class FilterTo extends c.Modifier {
    get modifierType() {
      return 'FilterTo';
    }

    /**
     * triggered whenever the "from" data or any of the "withs" changes.
     * it passes:
     * 1) the content of the from data
     * 2) the change (may be to from or any of the "with" data)
     * 3) an object of any data added to using the "with" method
     *
     * if there is a target, the result is
     * @param change
     */
    onChange(change) {
      if (!this._inited) return;
      const result = this.callback(this.from.content, this._withObj, change);
      if (this.target) {
        if (this.target instanceof c.Data) {
          this.target.replace(result);
        } else if (typeof this.target === 'function') {
          this.target(result, change, this);
        } else {
          throw new Error('strange target!');
        }
      }
    }
  });
});
// CONCATENATED MODULE: ./src/Modifier.js


/**
 * Callbacks are "Holistic" observers. Its central lever is a function that is called whenever
 * a Data instance changes.
 *
 * There is a primary Data that the callback checks, but it can be a funnel for multiple
 * Data objects, updating every time any one of them change.
 *
 * Callbacks work in one of two ways.
 *
 *  1) if there is NO "target" designated, its just a "change callback",
 *    triggered every time the Data (or a data in withData) changes;
 *    this is a good way to bridge information out of one Data object,
 *    or do other unions of several Data collections.
 *
 *  2) if there is a "target" and it is a Data, the result of the callback replaces
 *     the entire "target"'s contents.
 *
 *  3) if there is a "target" and it is a function, that function is called with the result
 *     of the callback  every time one of the watched Data changes. This is a good way to,
 *     for instance, replace a field of a Data collection with the result of an operation.
 *
 * note - the result of reduction is an instance of the same type as the target
 * @param b
 *
 */

/* harmony default export */ var Modifier = (b => {
  b.factory('Modifier', c => class ReduceTo {
    constructor(from, callback, target, ...withData) {
      this._withSet = new Set();
      this.target = target;
      this.from = from;
      this.callback = callback;
      this.withData = withData;
      this._inited = false;
    }

    get withData() {
      return Array.from(this._withSet.values());
    }

    get callback() {
      return this._callback;
    }

    set callback(value) {
      if (!value && typeof value === 'function') {
        throw new Error('callback must be a function');
      }
      this._callback = value;
    }

    /**
     * note -- this is an additive method; it won't clear out old withs
     * just adds new ones.
     * @param withs
     */
    set withData(withs) {
      if (withs) {
        let withList;
        if (Array.isArray(withs)) {
          withList = withs;
        } else if (withs instanceof c.Data) {
          withList = [withs];
        } else {
          throw new Error('withs must be a Data instance or an array of them.');
        }
        Object(external__lodash_["compact"])(Object(external__lodash_["flattenDeep"])(withList)).forEach(data => this._addWith(data));
      }
    }

    get _withObj() {
      return Array.from(this._withSet.values()).reduce((memo, data) => {
        memo[data.name] = data.content;
        return memo;
      }, {});
    }

    _addWith(data) {
      if (!data && data instanceof c.Data) {
        throw new Error('withs must be a Data instance.');
      }
      if (this._withSet.has(data)) return;
      this._watch(data);
    }

    /**
     * watch links change in the parameter to trigger onChange.
     *
     * Both the primary (from) data collection and any "withs"
     * pass through `._watch`.
     *
     * @param data {c.Data}
     * @private
     */
    _watch(data) {
      if (!c.typeof(data) === 'Data') {
        throw new Error('watch targets must be a Data instance.');
      }

      if (this._withSet.has(data)) return;
      this._withSet.add(data);

      this._emitToData(data);
      data.outputs.add(this);
    }

    _emitToData(data) {
      if (!(c.typeof(data) === 'Data')) {
        console.log('bad watch: ', data);
        throw new Error('watch targets must be a Data instance.');
      }
      try {
        data.on('change', this.onChange, this);
      } catch (err) {
        console.log('bad watch: ', data, err);
      }
    }

    /**
     * the action that gets triggered on a change of from or a with Data.
     * note that when you manually initialize the modifier, there will be no change.
     * @param change
     */
    onChange(change) {
      throw new Error('must override');
    }

    init() {
      this._inited = true;
      if (this.target) this.onChange(null);
    }

    into(target, init = false) {
      this.target = target;
      if (init) this.init();
      return this;
    }

    toNew(type, name, initialize = false) {
      this.target = c.toData(c.blankOf(type), name);
      if (initialize) this.init();
      return this;
    }

    toNewArray(name, initialize = false) {
      return this.toNew(c.DATATYPE_ARRAY, name, initialize);
    }

    toNewMap(name, initialize = false) {
      return this.toNew(c.DATATYPE_MAP, name, initialize);
    }

    toNewObject(name, initialize = false) {
      return this.toNew(c.DATATYPE_OBJECT, name, initialize);
    }

    /**
     * a curried way to add a with after construction;
     * @param data
     * @returns {ReduceTo}
     */
    with(data) {
      this._addWith(data);
      return this;
    }

    get target() {
      return this._target;
    }

    /**
     * target is either
     * a Data instance (which is replaced on change)
     * OR a function that the result is passed to.
     *
     * @param target
     */
    set target(target) {
      if (target && !(typeof target === 'function' || target instanceof c.Data)) {
        throw new Error('target must be instance of Data (or empty)');
      }
      this._target = target || null;
    }

    get from() {
      return this._from;
    }

    set from(data) {
      if (this._from) throw new Error('cannot change from');
      if (!(data instanceof c.Data)) throw new Error('from must be a Data instance');
      this._from = data;
      this._watch(data);
    }
  });
});
// CONCATENATED MODULE: ./src/ReduceTo.js


/**
 * ReduceTo uses the classic Reduce algorithm to produce a result, iterating through the
 * targets values.
 *
 * the end result is applied in one of two ways.
 *
 *  1) if there is a "target" and it is a Data, the result of the callback replaces
 *     the entire "target"'s contents.
 *
 *  2) if there is a "target" and it is a function, that function is called with the result
 *     of the callback  every time one of the watched Data changes. This is a good way to,
 *     for instance, replace a field of a Data collection with the result of an operation.
 *
 * note - the result of reduction is an instance of the same type as the target
 * @param b
 */
/* harmony default export */ var src_ReduceTo = (b => {
  b.factory('ReduceTo', c => class ReduceTo extends c.Modifier {
    get modifierType() {
      return 'ReduceTo';
    }

    constructor(from, callback, target, type, ...withData) {
      const typeofTarget = c.typeof(target);
      const typeofType = c.typeof(type);

      if (typeofType !== 'DATATYPE') {
        if (typeofTarget === 'function') {
          throw new Error('functional target requires type specification');
        } else if (typeofTarget === 'Data') {
          if (typeofType !== 'DATATYPE') {
            type = target.type;
          }
        } else if (typeofTarget === 'DATATYPE') {
          type = target;
          target = null;
        }
      }

      if (!type && target) {
        type = target.type;
      }

      withData = Object(external__lodash_["flattenDeep"])([type, withData]).filter(item => c.typeof(item) === 'Data');

      super(from, callback, target, ...withData);
      this.targetType = type;
    }

    onChange(change) {
      if (!this._inited) return;
      let memo = c.blankOf(this.targetType);
      const callback = this.callback;

      Array.from(this.from.entries).forEach(([key, value]) => {
        memo = callback(memo, value, key, this._withObj, change);
      });

      if (this.target) {
        this.target.replace(memo);
      }
    }
  });
});
// CONCATENATED MODULE: ./src/types.js


/* harmony default export */ var types = (bottle => {
  bottle.constant('DATATYPE_MAP', Symbol('DATATYPE_MAP'));
  bottle.constant('DATATYPE_OBJECT', Symbol('DATATYPE_OBJECT'));
  bottle.constant('DATATYPE_ARRAY', Symbol('DATATYPE_ARRAY'));
  bottle.constant('DATATYPE_VALUE', Symbol('DATATYPE_VALUE'));

  bottle.factory('DATATYPES', c => [c.DATATYPE_MAP, c.DATATYPE_OBJECT, c.DATATYPE_ARRAY, c.DATATYPE_VALUE]);

  bottle.factory('typeof', c => identifyMe => {
    if (!identifyMe) return 'empty';

    if (identifyMe instanceof c.Data) return 'Data';

    if (identifyMe instanceof Map) return 'Map';

    if (Array.isArray(identifyMe)) return 'Array';

    if (Object(external__lodash_["includes"])(c.DATATYPES, identifyMe)) {
      return 'DATATYPE';
    }

    return typeof identifyMe;
  });

  bottle.factory('dataType', c => item => {
    if (item === null) return c.DATATYPE_VALUE;
    if (Array.isArray(item)) return c.DATATYPE_ARRAY;
    if (item instanceof Map) return c.DATATYPE_MAP;
    if (typeof item === 'object') return c.DATATYPE_OBJECT;
    return c.DATATYPE_VALUE;
  });

  bottle.factory('blankOf', c => dataType => {
    if (!(c.typeof(dataType) === 'DATATYPE')) {
      throw new Error(`cannot Blankof ${dataType}`);
    }
    let out = {};
    switch (dataType) {
      case c.DATATYPE_ARRAY:
        out = [];
        break;

      case c.DATATYPE_MAP:
        out = new Map();
        break;

      case c.DATATYPE_OBJECT:
        out = {};
        break;

      default:
        console.log('Cthulu lives');
    }
    return out;
  });
});
// CONCATENATED MODULE: ./src/Key.js


/* harmony default export */ var Key = (bottle => {
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

    get modifierType() {
      return 'KeyTo';
    }

    onRemove({ change }) {
      const { index, name } = change;
      const key = this.from.type === c.DATATYPE_ARRAY ? index : name;
      const value = this.from.get(key);
      this.target.remove(this.callback(value, key, change, this));
    }

    onSplice({ change }) {
      if (!this.target) return;
      const {
        added, removed
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

    _emitToData(data) {
      if (data.name === this.from.name) {
        data.on('replace', this.onSet, this);
        data.on('remove', this.onRemove, this);
        data.on('splice', this.onSplice, this);
        data.on('add', this.onSet, this);
        data.on('update', this.onSet, this);
      } else {
        super._emitToData(data);
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
});
// CONCATENATED MODULE: ./src/bottle.js














/* harmony default export */ var src_bottle = (() => {
  const b = new external__bottlejs__default.a();
  src_Data(b);
  DataValue(b);
  DataArray(b);
  src_DataMap(b);
  src_DataObject(b);
  MapTo(b);
  Transaction(b);
  Modifier(b);
  FilterTo(b);
  src_ReduceTo(b);
  types(b);
  Key(b);
  return b;
});
// CONCATENATED MODULE: ./src/index.js


const myBottle = src_bottle();

/* harmony default export */ var src = __webpack_exports__["default"] = (myBottle.container);

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("bottlejs");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("text-table");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("eventemitter3");

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map

module.exports = waterfall.default;

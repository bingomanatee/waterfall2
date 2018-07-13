import { flattenDeep } from 'lodash';

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
export default(b) => {
  b.factory('ReduceTo', c => class ReduceTo extends c.Modifier {
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

      withData = flattenDeep([type, withData]).filter(item => c.typeof(item) === 'Data');

      super(from, callback, target, ...withData);
      this.targetType = type;
    }

    onChange(change) {
      let memo = c.blankOf(this.targetType);
      Array.from(this.from.entries).forEach(([key, value]) => {
        memo = this.callback(memo, value, key, change, this._withObj);
      });

      if (this.target) {
        this.target.content = memo;
      }
      return memo;
    }
  });
};

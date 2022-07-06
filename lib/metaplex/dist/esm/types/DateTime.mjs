import BN from 'bn.js';
import assert from '../utils/assert.mjs';

const toDateTime = value => {
  if (typeof value === 'string' || isDateObject(value)) {
    const date = new Date(value);
    const timestamp = Math.floor(date.getTime() / 1000);
    return new BN(timestamp);
  }

  return new BN(value);
};
const toOptionDateTime = value => {
  return value === null ? null : toDateTime(value);
};
const isDateTime = value => {
  return (value === null || value === void 0 ? void 0 : value.__opaque__) === 'DateTime';
};
const assertDateTime = value => {
  assert(isDateTime(value), 'Expected DateTime type');
};

const isDateObject = value => {
  return Object.prototype.toString.call(value) === '[object Date]';
};

export { assertDateTime, isDateTime, toDateTime, toOptionDateTime };
//# sourceMappingURL=DateTime.mjs.map

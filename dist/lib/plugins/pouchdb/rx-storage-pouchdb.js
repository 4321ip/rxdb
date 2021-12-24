"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RxStoragePouch = void 0;
exports.checkPouchAdapter = checkPouchAdapter;
exports.createIndexesOnPouch = void 0;
exports.getPouchLocation = getPouchLocation;
exports.getRxStoragePouch = getRxStoragePouch;

var _util = require("../../util");

var _pouchDb = require("./pouch-db");

var _rxError = require("../../rx-error");

var _rxSchema = require("../../rx-schema");

var _rxStorageInstancePouch = require("./rx-storage-instance-pouch");

var _rxStorageKeyObjectInstancePouch = require("./rx-storage-key-object-instance-pouch");

var _pouchStatics = require("./pouch-statics");

/**
 * Creates the indexes of the schema inside of the pouchdb instance.
 * Will skip indexes that already exist.
 */
var createIndexesOnPouch = function createIndexesOnPouch(pouch, schema) {
  try {
    if (!schema.indexes) {
      return Promise.resolve();
    }

    var primaryKey = (0, _rxSchema.getPrimaryFieldOfPrimaryKey)(schema.primaryKey);
    return Promise.resolve(pouch.getIndexes()).then(function (before) {
      var existingIndexes = new Set(before.indexes.map(function (idx) {
        return idx.name;
      }));
      return Promise.resolve(Promise.all(schema.indexes.map(function (indexMaybeArray) {
        try {
          var indexArray = Array.isArray(indexMaybeArray) ? indexMaybeArray : [indexMaybeArray];
          /**
           * replace primary key with _id
           * because that is the enforced primary key on pouchdb.
           */

          indexArray = indexArray.map(function (key) {
            if (key === primaryKey) {
              return '_id';
            } else {
              return key;
            }
          });
          var indexName = 'idx-rxdb-index-' + indexArray.join(',');

          if (existingIndexes.has(indexName)) {
            // index already exists
            return Promise.resolve();
          }
          /**
           * TODO we might have even better performance by doing a bulkDocs
           * on index creation
           */


          return Promise.resolve(pouch.createIndex({
            name: indexName,
            ddoc: indexName,
            index: {
              fields: indexArray
            }
          }));
        } catch (e) {
          return Promise.reject(e);
        }
      }))).then(function () {});
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
/**
 * returns the pouchdb-database-name
 */


exports.createIndexesOnPouch = createIndexesOnPouch;

var RxStoragePouch = /*#__PURE__*/function () {
  function RxStoragePouch(adapter) {
    var pouchSettings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    this.name = 'pouchdb';
    this.statics = _pouchStatics.RxStoragePouchStatics;
    this.adapter = adapter;
    this.pouchSettings = pouchSettings;
    checkPouchAdapter(adapter);
  }

  var _proto = RxStoragePouch.prototype;

  _proto.createPouch = function createPouch(location, options) {
    try {
      var _this2 = this;

      var pouchDbParameters = {
        location: location,
        adapter: (0, _util.adapterObject)(_this2.adapter),
        settings: options
      };
      var pouchDBOptions = Object.assign({}, pouchDbParameters.adapter, _this2.pouchSettings, pouchDbParameters.settings);
      var pouch = new _pouchDb.PouchDB(pouchDbParameters.location, pouchDBOptions);
      /**
       * In the past we found some errors where the PouchDB is not directly useable
       * so we we had to call .info() first to ensure it can be used.
       * I commented this out for now to get faster database/collection creation.
       * We might have to add this again if something fails.
       */
      // await pouch.info();

      return Promise.resolve(pouch);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.createStorageInstance = function createStorageInstance(params) {
    try {
      var _this4 = this;

      var pouchLocation = getPouchLocation(params.databaseName, params.collectionName, params.schema.version);
      return Promise.resolve(_this4.createPouch(pouchLocation, params.options)).then(function (pouch) {
        return Promise.resolve(createIndexesOnPouch(pouch, params.schema)).then(function () {
          return new _rxStorageInstancePouch.RxStorageInstancePouch(params.databaseName, params.collectionName, params.schema, {
            pouch: pouch
          }, params.options);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.createKeyObjectStorageInstance = function createKeyObjectStorageInstance(params) {
    try {
      var _this6 = this;

      var useOptions = (0, _util.flatClone)(params.options); // no compaction because this only stores local documents

      useOptions.auto_compaction = false;
      useOptions.revs_limit = 1;
      /**
       * TODO shouldnt we use a different location
       * for the local storage? Or at least make sure we
       * reuse the same pouchdb instance?
       */

      var pouchLocation = getPouchLocation(params.databaseName, params.collectionName, 0);
      return Promise.resolve(_this6.createPouch(pouchLocation, params.options)).then(function (pouch) {
        return new _rxStorageKeyObjectInstancePouch.RxStorageKeyObjectInstancePouch(params.databaseName, params.collectionName, {
          pouch: pouch
        }, params.options);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return RxStoragePouch;
}();
/**
 * Checks if all is ok with the given adapter,
 * else throws an error.
 */


exports.RxStoragePouch = RxStoragePouch;

function checkPouchAdapter(adapter) {
  if (typeof adapter === 'string') {
    // TODO make a function hasAdapter()
    if (!_pouchDb.PouchDB.adapters || !_pouchDb.PouchDB.adapters[adapter]) {
      throw (0, _rxError.newRxError)('DB9', {
        adapter: adapter
      });
    }
  } else {
    (0, _pouchDb.isLevelDown)(adapter);

    if (!_pouchDb.PouchDB.adapters || !_pouchDb.PouchDB.adapters.leveldb) {
      throw (0, _rxError.newRxError)('DB10', {
        adapter: adapter
      });
    }
  }
}

function getPouchLocation(dbName, collectionName, schemaVersion) {
  var prefix = dbName + '-rxdb-' + schemaVersion + '-';

  if (!collectionName.includes('/')) {
    return prefix + collectionName;
  } else {
    // if collectionName is a path, we have to prefix the last part only
    var split = collectionName.split('/');
    var last = split.pop();
    var ret = split.join('/');
    ret += '/' + prefix + last;
    return ret;
  }
}

function getRxStoragePouch(adapter, pouchSettings) {
  if (!adapter) {
    throw new Error('adapter missing');
  }

  var storage = new RxStoragePouch(adapter, pouchSettings);
  return storage;
}
//# sourceMappingURL=rx-storage-pouchdb.js.map
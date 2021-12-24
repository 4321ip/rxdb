import { map } from 'rxjs/operators';
import { blobBufferUtil, flatClone } from './../util';
import { newRxError } from '../rx-error';
import { writeSingle } from '../rx-storage-helper';
import { _handleToStorageInstance } from '../rx-collection-helper';

function ensureSchemaSupportsAttachments(doc) {
  var schemaJson = doc.collection.schema.jsonSchema;

  if (!schemaJson.attachments) {
    throw newRxError('AT1', {
      link: 'https://pubkey.github.io/rxdb/rx-attachment.html'
    });
  }
}

export var getAttachmentDataMeta = function getAttachmentDataMeta(storageStatics, data) {
  try {
    return Promise.resolve(storageStatics.hash(data)).then(function (hash) {
      var length = blobBufferUtil.size(data);
      return {
        digest: storageStatics.hashKey + '-' + hash,
        length: length
      };
    });
  } catch (e) {
    return Promise.reject(e);
  }
};
export var postMigrateDocument = function postMigrateDocument(_action) {
  /**
   * No longer needed because
   * we store the attachemnts data buffers directly in the document.
   */
  return Promise.resolve();
};
export var preMigrateDocument = function preMigrateDocument(data) {
  try {
    var attachments = data.docData._attachments;

    var _temp10 = function () {
      if (attachments) {
        var mustDecrypt = !!shouldEncrypt(data.oldCollection.schema);
        var newAttachments = {};
        return Promise.resolve(Promise.all(Object.keys(attachments).map(function (attachmentId) {
          try {
            var attachment = attachments[attachmentId];
            var docPrimary = data.docData[data.oldCollection.schema.primaryPath];
            return Promise.resolve(data.oldCollection.storageInstance.getAttachmentData(docPrimary, attachmentId)).then(function (rawAttachmentData) {
              function _temp12() {
                return Promise.resolve(getAttachmentDataMeta(data.oldCollection.database.storage.statics, rawAttachmentData)).then(function (meta) {
                  newAttachments[attachmentId] = {
                    digest: meta.digest,
                    length: meta.length,
                    type: attachment.type,
                    data: rawAttachmentData
                  };
                });
              }

              var _temp11 = function () {
                if (mustDecrypt) {
                  return Promise.resolve(blobBufferUtil.toString(rawAttachmentData).then(function (dataString) {
                    return blobBufferUtil.createBlobBuffer(data.oldCollection._crypter._decryptString(dataString), attachment.type);
                  })).then(function (_blobBufferUtil$toStr) {
                    rawAttachmentData = _blobBufferUtil$toStr;
                  });
                }
              }();

              return _temp11 && _temp11.then ? _temp11.then(_temp12) : _temp12(_temp11);
            });
          } catch (e) {
            return Promise.reject(e);
          }
        }))).then(function () {
          /**
           * Hooks mutate the input
           * instead of returning stuff
           */
          data.docData._attachments = newAttachments;
        });
      }
    }();

    return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(function () {}) : void 0);
  } catch (e) {
    return Promise.reject(e);
  }
};
export var putAttachment = function putAttachment(_ref3) {
  try {
    var _temp7 = function _temp7() {
      var statics = _this6.collection.database.storage.statics;
      _this6._atomicQueue = _this6._atomicQueue.then(function () {
        try {
          var _temp5 = function _temp5(_result) {
            if (_exit2) return _result;
            var docWriteData = flatClone(_this6._data);
            docWriteData._attachments = flatClone(docWriteData._attachments);
            return Promise.resolve(getAttachmentDataMeta(_this6.collection.database.storage.statics, data)).then(function (meta) {
              docWriteData._attachments[id] = {
                digest: meta.digest,
                length: meta.length,
                type: type,
                data: data
              };
              var writeRow = {
                previous: _handleToStorageInstance(_this6.collection, flatClone(_this6._data)),
                document: _handleToStorageInstance(_this6.collection, flatClone(docWriteData))
              };
              return Promise.resolve(writeSingle(_this6.collection.storageInstance, writeRow)).then(function (writeResult) {
                var attachmentData = writeResult._attachments[id];
                var attachment = fromStorageInstanceResult(id, attachmentData, _this6);
                var newData = flatClone(_this6._data);
                newData._rev = writeResult._rev;
                newData._attachments = writeResult._attachments;

                _this6._dataSync$.next(newData);

                return attachment;
              });
            });
          };

          var _exit2 = false;

          var _temp6 = function () {
            if (skipIfSame && _this6._data._attachments && _this6._data._attachments[id]) {
              var currentMeta = _this6._data._attachments[id];
              return Promise.resolve(statics.hash(data)).then(function (newHash) {
                var newDigest = statics.hashKey + '-' + newHash;

                if (currentMeta.type === type && currentMeta.digest === newDigest) {
                  // skip because same data and same type
                  var _this5$getAttachment2 = _this6.getAttachment(id);

                  _exit2 = true;
                  return _this5$getAttachment2;
                }
              });
            }
          }();

          return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(_temp5) : _temp5(_temp6));
        } catch (e) {
          return Promise.reject(e);
        }
      });
      return _this6._atomicQueue;
    };

    var _arguments2 = arguments,
        _this6 = this;

    var id = _ref3.id,
        data = _ref3.data,
        _ref3$type = _ref3.type,
        type = _ref3$type === void 0 ? 'text/plain' : _ref3$type;
    var skipIfSame = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : true;
    ensureSchemaSupportsAttachments(_this6);
    /**
     * Then encryption plugin is only able to encrypt strings,
     * so unpack as string first.
     */

    var _temp8 = function () {
      if (shouldEncrypt(_this6.collection.schema)) {
        return Promise.resolve(blobBufferUtil.toString(data)).then(function (dataString) {
          var encrypted = _this6.collection._crypter._encryptString(dataString);

          data = blobBufferUtil.createBlobBuffer(encrypted, 'text/plain');
        });
      }
    }();

    return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(_temp7) : _temp7(_temp8));
  } catch (e) {
    return Promise.reject(e);
  }
};
/**
 * get an attachment of the document by its id
 */

var _assignMethodsToAttachment = function _assignMethodsToAttachment(attachment) {
  Object.entries(attachment.doc.collection.attachments).forEach(function (_ref) {
    var funName = _ref[0],
        fun = _ref[1];
    Object.defineProperty(attachment, funName, {
      get: function get() {
        return fun.bind(attachment);
      }
    });
  });
};
/**
 * an RxAttachment is basically just the attachment-stub
 * wrapped so that you can access the attachment-data
 */


export var RxAttachment = /*#__PURE__*/function () {
  function RxAttachment(_ref2) {
    var doc = _ref2.doc,
        id = _ref2.id,
        type = _ref2.type,
        length = _ref2.length,
        digest = _ref2.digest;
    this.doc = doc;
    this.id = id;
    this.type = type;
    this.length = length;
    this.digest = digest;

    _assignMethodsToAttachment(this);
  }

  var _proto = RxAttachment.prototype;

  _proto.remove = function remove() {
    try {
      var _this2 = this;

      _this2.doc._atomicQueue = _this2.doc._atomicQueue.then(function () {
        try {
          var docWriteData = flatClone(_this2.doc._data);
          docWriteData._attachments = flatClone(docWriteData._attachments);
          delete docWriteData._attachments[_this2.id];
          return Promise.resolve(writeSingle(_this2.doc.collection.storageInstance, {
            previous: _handleToStorageInstance(_this2.doc.collection, flatClone(_this2.doc._data)),
            document: _handleToStorageInstance(_this2.doc.collection, docWriteData)
          })).then(function (writeResult) {
            var newData = flatClone(_this2.doc._data);
            newData._rev = writeResult._rev;
            newData._attachments = writeResult._attachments;

            _this2.doc._dataSync$.next(newData);
          });
        } catch (e) {
          return Promise.reject(e);
        }
      });
      return Promise.resolve(_this2.doc._atomicQueue);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  /**
   * returns the data for the attachment
   */
  ;

  _proto.getData = function getData() {
    try {
      var _this4 = this;

      return Promise.resolve(_this4.doc.collection.storageInstance.getAttachmentData(_this4.doc.primary, _this4.id)).then(function (plainData) {
        if (shouldEncrypt(_this4.doc.collection.schema)) {
          return Promise.resolve(blobBufferUtil.toString(plainData)).then(function (dataString) {
            var ret = blobBufferUtil.createBlobBuffer(_this4.doc.collection._crypter._decryptString(dataString), _this4.type);
            return ret;
          });
        } else {
          return plainData;
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  _proto.getStringData = function getStringData() {
    return this.getData().then(function (bufferBlob) {
      return blobBufferUtil.toString(bufferBlob);
    });
  };

  return RxAttachment;
}();
export function fromStorageInstanceResult(id, attachmentData, rxDocument) {
  return new RxAttachment({
    doc: rxDocument,
    id: id,
    type: attachmentData.type,
    length: attachmentData.length,
    digest: attachmentData.digest
  });
}

function shouldEncrypt(schema) {
  return !!(schema.jsonSchema.attachments && schema.jsonSchema.attachments.encrypted);
}

export function getAttachment(id) {
  ensureSchemaSupportsAttachments(this);

  var docData = this._dataSync$.getValue();

  if (!docData._attachments || !docData._attachments[id]) return null;
  var attachmentData = docData._attachments[id];
  var attachment = fromStorageInstanceResult(id, attachmentData, this);
  return attachment;
}
/**
 * returns all attachments of the document
 */

export function allAttachments() {
  var _this7 = this;

  ensureSchemaSupportsAttachments(this);

  var docData = this._dataSync$.getValue(); // if there are no attachments, the field is missing


  if (!docData._attachments) {
    return [];
  }

  return Object.keys(docData._attachments).map(function (id) {
    return fromStorageInstanceResult(id, docData._attachments[id], _this7);
  });
}
export var rxdb = true;
export var prototypes = {
  RxDocument: function RxDocument(proto) {
    proto.putAttachment = putAttachment;
    proto.getAttachment = getAttachment;
    proto.allAttachments = allAttachments;
    Object.defineProperty(proto, 'allAttachments$', {
      get: function allAttachments$() {
        var _this8 = this;

        return this._dataSync$.pipe(map(function (data) {
          if (!data['_attachments']) {
            return {};
          }

          return data['_attachments'];
        }), map(function (attachmentsData) {
          return Object.entries(attachmentsData);
        }), map(function (entries) {
          return entries.map(function (_ref4) {
            var id = _ref4[0],
                attachmentData = _ref4[1];
            return fromStorageInstanceResult(id, attachmentData, _this8);
          });
        }));
      }
    });
  }
};
export var overwritable = {};
export var hooks = {
  preMigrateDocument: preMigrateDocument,
  postMigrateDocument: postMigrateDocument
};
export var RxDBAttachmentsPlugin = {
  name: 'attachments',
  rxdb: rxdb,
  prototypes: prototypes,
  overwritable: overwritable,
  hooks: hooks
};
//# sourceMappingURL=attachments.js.map
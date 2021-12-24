import { Observable } from 'rxjs';
import type { RxStorageInstance, LokiSettings, RxStorageChangeEvent, RxDocumentData, BulkWriteRow, RxStorageBulkWriteResponse, RxStorageQueryResult, BlobBuffer, ChangeStreamOnceOptions, RxJsonSchema, MangoQuery, LokiStorageInternals, RxStorageChangedDocumentMeta, RxStorageInstanceCreationParams, LokiDatabaseSettings, LokiLocalDatabaseState, EventBulk } from '../../types';
import type { RxStorageLoki } from './rx-storage-lokijs';
export declare class RxStorageInstanceLoki<RxDocType> implements RxStorageInstance<RxDocType, LokiStorageInternals, LokiSettings> {
    readonly storage: RxStorageLoki;
    readonly databaseName: string;
    readonly collectionName: string;
    readonly schema: Readonly<RxJsonSchema<RxDocType>>;
    readonly internals: LokiStorageInternals;
    readonly options: Readonly<LokiSettings>;
    readonly databaseSettings: LokiDatabaseSettings;
    readonly primaryPath: keyof RxDocType;
    private changes$;
    private lastChangefeedSequence;
    readonly instanceId: number;
    closed: boolean;
    constructor(storage: RxStorageLoki, databaseName: string, collectionName: string, schema: Readonly<RxJsonSchema<RxDocType>>, internals: LokiStorageInternals, options: Readonly<LokiSettings>, databaseSettings: LokiDatabaseSettings);
    /**
     * Adds an entry to the changes feed
     * that can be queried to check which documents have been
     * changed since sequence X.
     */
    private addChangeDocumentMeta;
    bulkWrite(documentWrites: BulkWriteRow<RxDocType>[]): Promise<RxStorageBulkWriteResponse<RxDocType>>;
    bulkAddRevisions(documents: RxDocumentData<RxDocType>[]): Promise<void>;
    findDocumentsById(ids: string[], deleted: boolean): Promise<{
        [documentId: string]: RxDocumentData<RxDocType>;
    }>;
    query(preparedQuery: MangoQuery<RxDocType>): Promise<RxStorageQueryResult<RxDocType>>;
    getAttachmentData(_documentId: string, _attachmentId: string): Promise<BlobBuffer>;
    getChangedDocuments(options: ChangeStreamOnceOptions): Promise<{
        changedDocuments: RxStorageChangedDocumentMeta[];
        lastSequence: number;
    }>;
    changeStream(): Observable<EventBulk<RxStorageChangeEvent<RxDocumentData<RxDocType>>>>;
    close(): Promise<void>;
    remove(): Promise<void>;
}
export declare function createLokiLocalState<RxDocType>(params: RxStorageInstanceCreationParams<RxDocType, LokiSettings>, databaseSettings: LokiDatabaseSettings): Promise<LokiLocalDatabaseState>;
export declare function createLokiStorageInstance<RxDocType>(storage: RxStorageLoki, params: RxStorageInstanceCreationParams<RxDocType, LokiSettings>, databaseSettings: LokiDatabaseSettings): Promise<RxStorageInstanceLoki<RxDocType>>;

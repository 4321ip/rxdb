import { Observable } from 'rxjs';
import type { BulkWriteLocalRow, EventBulk, LokiDatabaseSettings, LokiLocalDatabaseState, LokiSettings, LokiStorageInternals, RxKeyObjectStorageInstanceCreationParams, RxLocalDocumentData, RxLocalStorageBulkWriteResponse, RxStorageChangeEvent, RxStorageKeyObjectInstance } from '../../types';
import type { RxStorageLoki } from './rx-storage-lokijs';
export declare class RxStorageKeyObjectInstanceLoki implements RxStorageKeyObjectInstance<LokiStorageInternals, LokiSettings> {
    readonly storage: RxStorageLoki;
    readonly databaseName: string;
    readonly collectionName: string;
    readonly internals: LokiStorageInternals;
    readonly options: Readonly<LokiSettings>;
    readonly databaseSettings: LokiDatabaseSettings;
    private changes$;
    instanceId: number;
    closed: boolean;
    constructor(storage: RxStorageLoki, databaseName: string, collectionName: string, internals: LokiStorageInternals, options: Readonly<LokiSettings>, databaseSettings: LokiDatabaseSettings);
    bulkWrite<RxDocType>(documentWrites: BulkWriteLocalRow<RxDocType>[]): Promise<RxLocalStorageBulkWriteResponse<RxDocType>>;
    findLocalDocumentsById<RxDocType = any>(ids: string[]): Promise<{
        [documentId: string]: RxLocalDocumentData<RxDocType>;
    }>;
    changeStream(): Observable<EventBulk<RxStorageChangeEvent<RxLocalDocumentData<{
        [key: string]: any;
    }>>>>;
    close(): Promise<void>;
    remove(): Promise<void>;
}
export declare function createLokiKeyValueLocalState(params: RxKeyObjectStorageInstanceCreationParams<LokiSettings>, databaseSettings: LokiDatabaseSettings): Promise<LokiLocalDatabaseState>;
export declare function createLokiKeyObjectStorageInstance(storage: RxStorageLoki, params: RxKeyObjectStorageInstanceCreationParams<LokiSettings>, databaseSettings: LokiDatabaseSettings): Promise<RxStorageKeyObjectInstanceLoki>;

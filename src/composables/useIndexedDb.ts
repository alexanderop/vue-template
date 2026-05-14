import { ref } from 'vue'
import type { Ref } from 'vue'
import { tryCatch } from '@/utils/tryCatch'
import type { Result } from '@/utils/tryCatch'

interface UseIndexedDbOptions {
  dbName: string
  storeName: string
  version?: number
}

interface UseIndexedDbReturn<T> {
  items: Ref<T[]>
  isReady: Ref<boolean>
  getAll(): Promise<Result<T[]>>
  add(item: T): Promise<Result<T>>
  update(item: T): Promise<Result<T>>
  remove(id: string): Promise<Result<void>>
  clear(): Promise<Result<void>>
}

function openDb(dbName: string, storeName: string, version: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version)
    request.addEventListener('upgradeneeded', () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' })
      }
    })
    request.addEventListener('success', () => resolve(request.result))
    request.addEventListener('error', () => reject(request.error))
  })
}

function idbRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => resolve(request.result))
    request.addEventListener('error', () => reject(request.error))
  })
}

export function useIndexedDb<T extends { id: string }>(
  options: UseIndexedDbOptions,
): UseIndexedDbReturn<T> {
  const { dbName, storeName, version = 1 } = options
  const items: Ref<T[]> = ref([])
  const isReady = ref(false)

  let dbInstance: IDBDatabase | null = null

  function getDb(): Promise<IDBDatabase> {
    if (dbInstance) {
      return Promise.resolve(dbInstance)
    }
    return openDb(dbName, storeName, version).then((db) => {
      dbInstance = db
      return db
    })
  }

  function getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    return getDb().then((db) => {
      const tx = db.transaction(storeName, mode)
      return tx.objectStore(storeName)
    })
  }

  function syncItems(): Promise<void> {
    return getAll().then(() => {})
  }

  function getAll(): Promise<Result<T[]>> {
    return tryCatch(
      getStore('readonly')
        .then((store) => idbRequest(store.getAll()))
        .then((all) => {
          items.value = all
          isReady.value = true
          return all
        }),
    )
  }

  function add(item: T): Promise<Result<T>> {
    return tryCatch(
      getStore('readwrite')
        .then((store) => idbRequest(store.add(item)))
        .then(() => syncItems())
        .then(() => item),
    )
  }

  function update(item: T): Promise<Result<T>> {
    return tryCatch(
      getStore('readwrite')
        .then((store) => idbRequest(store.put(item)))
        .then(() => syncItems())
        .then(() => item),
    )
  }

  function remove(id: string): Promise<Result<void>> {
    return tryCatch(
      getStore('readwrite')
        .then((store) => idbRequest(store.delete(id)))
        .then(() => syncItems()),
    )
  }

  function clear(): Promise<Result<void>> {
    return tryCatch(
      getStore('readwrite')
        .then((store) => idbRequest(store.clear()))
        .then(() => syncItems()),
    )
  }

  return { items, isReady, getAll, add, update, remove, clear }
}

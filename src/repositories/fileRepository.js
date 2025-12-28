const DB_NAME = 'markdown-editor';
const DB_VERSION = 1;
const STORE_NAME = 'files';

const state = {
  db: null,
  dbPromise: null,
};

export function createFileEntity(overrides = {}) {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: '無題',
    content: '',
    createdAt: now,
    updatedAt: now,
    sortKey: now,
    ...overrides,
  };
}

export function updateFileEntity(entity, changes = {}) {
  return {
    ...entity,
    ...changes,
    updatedAt: Date.now(),
  };
}

const ensureValidId = (id) => {
  if (typeof id !== 'string' || id.trim() === '') {
    throw new Error('ファイルIDが不正です。');
  }
};

const ensureValidEntity = (entity) => {
  if (!entity || typeof entity !== 'object') {
    throw new Error('ファイルデータが不正です。');
  }
  ensureValidId(entity.id);
  if (typeof entity.title !== 'string' || entity.title.trim() === '') {
    throw new Error('ファイル名が不正です。');
  }
  if (typeof entity.content !== 'string') {
    throw new Error('ファイル本文が不正です。');
  }
  if (!Number.isFinite(entity.createdAt)) {
    throw new Error('createdAtが不正です。');
  }
  if (!Number.isFinite(entity.updatedAt)) {
    throw new Error('updatedAtが不正です。');
  }
  if (!Number.isFinite(entity.sortKey)) {
    throw new Error('sortKeyが不正です。');
  }
};

const openDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

const ensureDb = async () => {
  if (state.db) {
    return state.db;
  }
  if (!state.dbPromise) {
    state.dbPromise = openDatabase();
  }
  state.db = await state.dbPromise;
  return state.db;
};

const requireDb = () => {
  if (!state.db) {
    throw new Error('データベースが初期化されていません。');
  }
};

const runTransaction = async (mode, runner) => {
  const db = await ensureDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);

    runner({ store, resolve, reject, transaction });
  });
};

export const fileRepository = {
  async init() {
    if (typeof indexedDB === 'undefined') {
      console.warn('IndexedDBが利用できません。');
      return false;
    }

    try {
      await ensureDb();
      return true;
    } catch (error) {
      console.warn('IndexedDBの初期化に失敗しました。', error);
      return false;
    }
  },

  async getAll() {
    requireDb();
    return runTransaction('readonly', ({ store, resolve, reject }) => {
      const index = store.index('updatedAt');
      const request = index.openCursor(null, 'prev');
      const results = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  async getById(id) {
    requireDb();
    ensureValidId(id);
    return runTransaction('readonly', ({ store, resolve, reject }) => {
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result ?? null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  async create(entity) {
    requireDb();
    ensureValidEntity(entity);
    return runTransaction('readwrite', ({ store, resolve, reject }) => {
      const request = store.add(entity);

      request.onsuccess = () => {
        resolve(entity);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  async update(entity) {
    requireDb();
    ensureValidEntity(entity);
    const existing = await this.getById(entity.id);
    if (!existing) {
      throw new Error('更新対象のファイルが存在しません。');
    }

    return runTransaction('readwrite', ({ store, resolve, reject }) => {
      const request = store.put(entity);

      request.onsuccess = () => {
        resolve(entity);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },

  async delete(id) {
    requireDb();
    ensureValidId(id);
    return runTransaction('readwrite', ({ store, resolve, reject }) => {
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  },
};

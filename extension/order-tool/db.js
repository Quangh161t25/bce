// db.js - Quản lý lưu trữ đơn hàng bằng IndexedDB
const DB_NAME = 'ShopeeOrderToolDB';
const DB_VERSION = 1;
const STORE_NAME = 'orders';

let dbInstance = null;

export function getDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'storageKey' });
        store.createIndex('by_orderId', 'orderId', { unique: false });
        store.createIndex('by_orderSn', 'orderSn', { unique: false });
        store.createIndex('by_createTime', 'createTime', { unique: false });
        store.createIndex('by_savedAt', 'savedAt', { unique: false });
      }
    };
    req.onsuccess = () => {
      dbInstance = req.result;
      resolve(dbInstance);
    };
    req.onerror = () => {
      reject(req.error || new Error('Không thể mở IndexedDB'));
    };
  });
}

export function getOrderKey(order) {
  if (!order) return '';
  return String(order.storageKey || order.orderId || order.orderSn || '');
}

export function ensureStorageKey(order) {
  if (!order) return '';
  const key = getOrderKey(order);
  if (!order.storageKey && key) {
    order.storageKey = key;
  }
  if (!order.savedAt) {
    order.savedAt = Date.now();
  }
  return key;
}

export async function getAllOrders() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('Lỗi lấy đơn từ IndexedDB:', e);
    return [];
  }
}

export async function saveOrder(order) {
  if (!order) return;
  const key = ensureStorageKey(order);
  if (!key) return;
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(order);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('Lỗi lưu đơn vào IndexedDB:', e);
  }
}

export async function saveOrders(orders) {
  if (!orders || !orders.length) return;
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const order of orders) {
        if (!order) continue;
        ensureStorageKey(order);
        if (order.storageKey) {
          store.put(order);
        }
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('Lỗi lưu danh sách đơn vào IndexedDB:', e);
  }
}

export async function clearAllOrders() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.error('Lỗi xoá IndexedDB:', e);
  }
}

export async function countOrders() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count();
      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return 0;
  }
}

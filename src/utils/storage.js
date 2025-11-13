export class Storage {
  constructor(type = 'session') {
    if (type === 'local') {
      this.storage = window.localStorage;
    } else {
      this.storage = window.sessionStorage;
    }
  }

  setItem(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Error setting item in storage:', err);
    }
  }

  getItem(key) {
    try {
      const item = this.storage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (err) {
      console.error('Error getting item from storage:', err);
      return null;
    }
  }

  removeItem(key) {
    try {
      this.storage.removeItem(key);
    } catch (err) {
      console.error('Error removing item from storage:', err);
    }
  }

  clear() {
    try {
      this.storage.clear();
    } catch (err) {
      console.error('Error clearing storage:', err);
    }
  }

  switch(type) {
    if (type === 'local') {
      this.storage = window.localStorage;
    } else if (type === 'session') {
      this.storage = window.sessionStorage;
    } else {
      throw new Error("Storage type must be 'local' or 'session'");
    }
  }
}

export const storage = new Storage('local');

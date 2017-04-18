import * as Promise from 'bluebird';
import * as EventEmitter from 'events';

export class EventEmitterPromise extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(256)
  }

  emitAsync(eventName: string, ...args): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.emit(eventName,  ...args)) {
        resolve(true);
      } else {
        reject(true);
      }
    });
  }

  onAsync(eventName: string, exception = true): Promise<any> {
    return new Promise((resolve, reject) => {
      this.on(eventName, resolve);
      exception && this.on('error', reject);
    });
  }

  onceAsync(eventName: string, exception = true): Promise<any> {
    return new Promise((resolve, reject) => {
      this.once(eventName, resolve);
      exception && this.once('error', reject);
    });
  }
}

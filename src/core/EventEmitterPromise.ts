import * as Promise from 'bluebird';
import * as EventEmitter from 'events';

export class EventEmitterPromise extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(256);
  }

  public emitAsync(eventName: string, ...args): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.emit(eventName,  ...args)) {
        resolve(true);
      } else {
        reject(true);
      }
    });
  }

  public onAsync(eventName: string, exception = true): Promise<any> {
    return new Promise((resolve, reject) => {
      this.on(eventName, resolve);
      if (exception) {
        this.on('error', reject);
      }
    });
  }

  public onceAsync(eventName: string, exception = true): Promise<any> {
    return new Promise((resolve, reject) => {
      this.once(eventName, resolve);
      if (exception) {
        this.once('error', reject);
      }
    });
  }
}

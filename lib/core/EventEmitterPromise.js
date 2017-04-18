"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
const EventEmitter = require("events");
class EventEmitterPromise extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(256);
    }
    emitAsync(eventName, ...args) {
        return new Promise((resolve, reject) => {
            if (this.emit(eventName, ...args)) {
                resolve(true);
            }
            else {
                reject(true);
            }
        });
    }
    onAsync(eventName, exception = true) {
        return new Promise((resolve, reject) => {
            this.on(eventName, resolve);
            exception && this.on('error', reject);
        });
    }
    onceAsync(eventName, exception = true) {
        return new Promise((resolve, reject) => {
            this.once(eventName, resolve);
            exception && this.once('error', reject);
        });
    }
}
exports.EventEmitterPromise = EventEmitterPromise;

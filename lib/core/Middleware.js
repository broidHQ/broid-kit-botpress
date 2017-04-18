"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@broid/utils");
const Rx_1 = require("rxjs/Rx");
const Promise = require("bluebird");
const botpress_1 = require("botpress");
const path = require("path");
const R = require("ramda");
const EventEmitterPromise_1 = require("./EventEmitterPromise");
class Middleware {
    constructor(obj) {
        this.logLevel = obj && obj.logLevel || 'info';
        this.startMaxRetry = obj && obj.logLevel || 10;
        this.logger = new utils_1.Logger('broidkit', this.logLevel);
        this.ready = false;
        this.botfile = path.join(obj.botpressPath, 'botfile.js');
        this.botpress = new botpress_1.Botpress({ botfile: this.botfile });
        this.emitter = new EventEmitterPromise_1.EventEmitterPromise();
        this.incoming = this.incoming.bind(this);
        this.outgoing = this.outgoing.bind(this);
        this.start();
    }
    start() {
        let retry = 0;
        this.botpress._start();
        const check = () => {
            return Promise.resolve().then(() => {
                this.logger.info('Polling...', typeof this.botpress.middlewares);
                if (this.botpress.middlewares && this.botpress.events) {
                    this.botpress.events.on('ready', () => this.ready = true);
                    this.botpress.middlewares.register(this.botpressIncomingMiddleware());
                    this.botpress.middlewares.register(this.botpressOutgoingMiddleware());
                    this.botpress.middlewares.load();
                    return Promise.resolve();
                }
                else if (retry >= this.startMaxRetry) {
                    return Promise.reject("poll error");
                }
                else {
                    retry = retry + 1;
                    return Promise.delay(1000).then(check);
                }
            });
        };
        return check();
    }
    haveContext(message) {
        const messageContext = R.prop('@context', message);
        if (!messageContext) {
            return false;
        }
        return true;
    }
    botpressIncomingMiddleware() {
        const handler = (event, next) => {
            this.logger.info("botpressIncomingMiddleware:handler - event:", event.text);
            this.emitter.emitAsync('incoming', event)
                .then(() => next())
                .catch(this.logger.error);
        };
        return {
            name: 'broidkit.incoming',
            type: 'incoming',
            order: 200,
            module: 'broidkit',
            description: 'The built-in hear convenience middleware',
            handler: handler.bind(this)
        };
    }
    botpressOutgoingMiddleware() {
        const handler = (event, next) => {
            this.logger.info("botpressOutgoingMiddleware:handler - event:", event.text);
            this.emitter.emitAsync('outgoing', event)
                .then(() => next())
                .catch(this.logger.error);
        };
        return {
            name: 'broidkit.outgoing',
            type: 'outgoing',
            order: 200,
            module: 'broidkit',
            description: 'The built-in hear convenience middleware',
            handler: handler.bind(this)
        };
    }
    serviceName() {
        return "broid-kit-botpress";
    }
    incoming(_, message) {
        if (!this.haveContext(message)) {
            return null;
        }
        this.logger.info("incoming from middleware:", JSON.stringify(message, null, 2));
        const context = R.path(['object', 'context'], message) || {};
        const action = R.prop('name', context);
        let contextContent = R.prop('content', context);
        let callback_id = null;
        if (contextContent) {
            callback_id = R.split('#', contextContent)[0];
        }
        return Rx_1.Observable.create((observer) => {
            this.emitter.onceAsync('incoming')
                .then((data) => {
                this.logger.info("incoming data from botpress event", data);
                observer.next(data);
                observer.complete();
            });
            this.botpress.middlewares.sendIncoming({
                platform: R.path(['generator', 'name'], message),
                type: 'message',
                text: R.path(['object', 'content'], message),
                user: message.actor,
                channel: message.target,
                action: action,
                action_type: action,
                callback_id: callback_id,
                ts: R.path(['generator', 'id'], message),
                action_ts: message.published,
                direct: R.path(['target', 'type'], message) === 'Person',
                raw: message
            });
        });
    }
    outgoing(_, content, message) {
        if (!this.haveContext(message)) {
            return null;
        }
        this.logger.info("outgoing from middleware: ", content);
        return Rx_1.Observable.create((observer) => {
            this.emitter.onceAsync('outgoing')
                .then((data) => {
                this.logger.info("outgoing data from botpress event", data);
                observer.next(data);
                observer.complete();
            });
            this.botpress.middlewares.sendOutgoing({
                __id: new Date().toISOString() + Math.random(),
                platform: R.path(['generator', 'name'], message),
                type: 'text',
                text: content,
                raw: {
                    content,
                    message
                }
            });
        });
    }
}
exports.Middleware = Middleware;

/* tslint:disable */

import { Logger } from '@broid/utils';
import { IActivityStream } from '@broid/schemas';

import { Observable } from 'rxjs/Rx';
import * as Promise from 'bluebird';
import { Botpress } from 'botpress';
import * as path from 'path';
import * as R from 'ramda';

import { EventEmitterPromise } from './EventEmitterPromise';

interface IOptions {
  logLevel: string;
  botpressPath: string;
  maxRetry?: any;
}

export class Middleware {
  private botpress: any;
  private botfile: string;
  private startMaxRetry: any;
  private emitter: EventEmitterPromise;
  private logLevel: string;
  private logger: Logger;
  private ready: boolean;

  constructor(obj: IOptions) {
    this.logLevel = obj && obj.logLevel || 'info';
    this.startMaxRetry = obj && obj.logLevel || 10;
    this.logger = new Logger('broidkit', this.logLevel);
    this.ready = false;

    this.botfile = path.join(obj.botpressPath, 'botfile.js');
    this.botpress = new Botpress({ botfile: this.botfile });

    this.emitter = new EventEmitterPromise();

    this.incoming = this.incoming.bind(this);
    this.outgoing = this.outgoing.bind(this);

    this.start();
  }

  private start() {
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
        } else if (retry >= this.startMaxRetry) {
          return Promise.reject("poll error");
        } else {
          retry = retry + 1;
          return Promise.delay(1000).then(check);
        }
      });
    };

    return check();
  }

  private haveContext(message: any): boolean {
    const messageContext = R.prop('@context', message);
    if (!messageContext) {
      return false;
    }
    return true;
  }

  private botpressIncomingMiddleware(): any {
    const handler = (event, next) => {
      this.logger.info("botpressIncomingMiddleware:handler - event:", event.text);
      this.emitter.emitAsync('incoming', event)
        .then(() => next())
        .catch(this.logger.error);
    }

    return {
      name: 'broidkit.incoming',
      type: 'incoming',
      order: 200,
      module: 'broidkit',
      description: 'The built-in hear convenience middleware',
      handler: handler.bind(this)
    };
  }

  private botpressOutgoingMiddleware(): any {
    const handler = (event, next) => {
      this.logger.info("botpressOutgoingMiddleware:handler - event:", event.text);
      this.emitter.emitAsync('outgoing', event)
        .then(() => next())
        .catch(this.logger.error);
    }

    return {
      name: 'broidkit.outgoing',
      type: 'outgoing',
      order: 200,
      module: 'broidkit',
      description: 'Not fully supported',
      handler: handler.bind(this)
    };
  }

  public serviceName() {
    return "broid-kit-botpress";
  }

  public incoming(_: any, message: IActivityStream): Observable<any> | null {
    if (!this.haveContext(message)) {
      return null;
    }

    this.logger.info("incoming from middleware:", JSON.stringify(message, null, 2));
    const context = R.path(['object', 'context'], message) || {};
    const action = R.prop('name', context);
    let contextContent = R.prop('content', context);
    let callback_id: null | string = null;
    if (contextContent) {
      callback_id = R.split('#', contextContent as string)[0];
    }

    return Observable.create((observer) => {
        this.emitter.onceAsync('incoming')
          .then((data) => {
            this.logger.info("incoming data from botpress event", data);
            observer.next(data);
            observer.complete();
        });

        // We send the message after the event registered
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

  public outgoing(_: any, content: string, message: IActivityStream): Observable<any> | null {
    if (!this.haveContext(message)) {
      return null;
    }

    this.logger.info("outgoing from middleware: ", content);
    return Observable.create((observer) => {
        this.emitter.onceAsync('outgoing')
          .then((data) => {
            this.logger.info("outgoing data from botpress event", data);
            observer.next(data);
            observer.complete();
        });

        // We send the message after the event registered
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

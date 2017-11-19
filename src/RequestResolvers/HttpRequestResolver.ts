import {Express} from 'express';
import * as express from 'express';
import {Server as HttpServer} from 'http';
import {Server as HttpsServer} from 'https';
import * as http from 'http';
import {LoggerInstance} from 'winston';
import {ConfigManager} from '../ConfigManager';
import {Stix} from '../Stix';
import {RequestResolver} from '../RequestResolver';
import {EventEmitter} from 'events';

type Server = HttpServer | HttpsServer;

/**
 * HTTP methods according to :
 * - https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html
 * - https://tools.ietf.org/html/rfc5789
 */
export enum HTTPMethod {
  OPTIONS,
  GET,
  HEAD,
  POST,
  PUT,
  DELETE,
  TRACE,
  CONNECT,
  PATCH,
}

/**
 * Cors config according to :
 * - https://www.w3.org/TR/2014/REC-cors-20140116/#syntax
 */
interface CorsConfig {
  'Access-Control-Allow-Origin' ?: [string],
  'Access-Control-Allow-Credentials'?: boolean,
  'Access-Control-Expose-Headers'?: [string],
  'Access-Control-Max-Age'?: number,
  'Access-Control-Allow-Methods'?: [HTTPMethod],
  'Access-Control-Allow-Headers'?: [string],
}

export class HttpRequestResolver extends RequestResolver {

  private logger: LoggerInstance;
  private server: Server;
  private stix: Stix;

  protected configManager: ConfigManager;
  protected eventEmitter: EventEmitter;
  protected app: Express;

  constructor(stix: Stix) {
    super();

    this.logger        = stix.getLogger();
    this.configManager = stix.getConfigManager();
    this.eventEmitter  = stix.getEventEmitter();
    this.stix          = stix;
  }

  public registerAppOn(mountpoint: string, app: Express) {
    this.app.use(mountpoint, app);
  }

  public onLoad(): void {
    this.app = express();

    // it should ask for sub-http RR to register their endpoints here, i guess using an event makes sense here

    this.stix.emit('hook:http-request-resolver:loaded', this);
  }

  public onLift(): Promise<void> {
    this.server = http.createServer(this.app);

    this.server.on('connection', connection => {
      this.logger.silly('Opening tcp connection from %s on %s', connection.remoteAddress, connection.remotePort);
    });

    const port = this.configManager.fetch('http.port');

    return new Promise(resolve => {
      this.server.listen(port, () => {
        this.logger.info('Stix lifting on %s', port);
        resolve();
      });
    });
  }

  public onLower(): Promise<void | Error> {
    if (!this.server) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.server.close(error => {
        if (error) {
          return reject(error);
        }

        return resolve();
      });
    });
  }
}

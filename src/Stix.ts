import {ModuleManager} from './ModuleManager';
import {ConfigManager} from './ConfigManager';
import {Logger} from './Logger';
import * as express from 'express';
import {Express} from 'express';
import {Wetland} from 'wetland';

import {LoggerInstance, transports as winstonTransports} from 'winston';
import {Server as HttpServer} from 'http';
import {Server as HttpsServer} from 'https';
import * as http from 'http';

type Server = HttpServer | HttpServer;

export class Stix {

  private moduleManager: ModuleManager;
  private logger: Logger;
  private configManager: ConfigManager;
  private wetland: Wetland;

  private app: Express;
  private server: Server;

  /**
   * Get the config manager.
   *
   * @return {ConfigManager}
   */
  public getConfigManager() {
    return this.configManager;
  }

  /**
   * Get wetland.
   *
   * @return {Wetland}
   */
  public getWetland() {
    return this.wetland;
  }

  /**
   *   Get logger.
   *
   * @return {winston.LoggerInstance}
   */
  public getLogger(): LoggerInstance {
    return this.logger.getWinston();
  }

  /**
   * Creates a Stix instance.
   *
   * @param {Object} configOverride
   */
  constructor(configOverride?: Object) {
    this.configManager = new ConfigManager(configOverride);

    this.logger        = new Logger(this);
    this.moduleManager = new ModuleManager(this);
    this.wetland       = new Wetland(this.configManager.fetch('wetland'));
  }

  /**
   * Load the app.
   */
  public load(): Promise<Stix> {
    this.moduleManager.loadModules();
    this.moduleManager.registerModules();

    this.app = express();

    return new Promise(resolve => resolve(this));
  }

  /**
   * Lift the app.
   *
   * @return {Promise<void>}
   */
  public lift(): Promise<void> {
    this.load();

    // The ideas is to mount a request resolver on different mountpoint

    // graphql rr on /graphql
    // rest rr on / or each /resource

    this.server = http.createServer(this.app);

    this.app.get('/', (req, res) => {
      res.send('Hello world');
    });

    this.server.on('connection', connection => {
      this.getLogger().silly('Opening tcp connection from %s on %s', connection.remoteAddress, connection.remotePort);
    });

    const port = this.configManager.fetch('http.port');
    return new Promise(resolve => {
      this.server.listen(port, () => {
        this.getLogger().info('Stix lifting on %s', port);
        resolve();
      });
    });
  }

  public lower(): Promise<void | Error> {
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

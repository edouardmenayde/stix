import * as path from 'path';
import {Homefront} from 'homefront';
import {transports as winstonTransports} from 'winston';
import * as include from 'include-all';
import * as moment from 'moment';

export class ConfigManager {

  /**
   * Where the application lives.
   *
   * @type {string}
   */
  public applicationPath = process.cwd();

  /**
   * Stix default config.
   *
   * Those defaults should be sensible for most people.
   *
   * @type {Homefront}
   */
  private config: Homefront = new Homefront({
    modules: [],
    logging: {
      transports: [new winstonTransports.Console({
        colorize : true,
        timestamp: () => moment().format('HH:mm:ss')
      })],
    },
    http   : {
      port: 5718
    }
  });

  /**
   * Initialize configuration.
   *
   * Configuration merging happens in the following order :
   * ENV variables > Config Override > main config > module config
   *
   * @param {Object} configOverride
   */
  constructor(configOverride?: Object) {
    if (configOverride && configOverride['applicationPath']) {
      this.applicationPath = configOverride['applicationPath'];
    }

    this.config.merge({
      paths: {
        config: path.resolve(this.applicationPath, 'config')
      }
    });

    if (configOverride) {
      this.config.merge(configOverride);
    }

    this.loadAppConfig();
  }

  /**
   * Load app config folder content.
   */
  private loadAppConfig() {
    const appConfig = include({
      dirname : this.config.fetch('paths.config'),
      filter  : /(.+)\.js/, // add ts,..., etc later (we should enable to use any js superset)
      optional: true,
    });

    this.config.merge(appConfig);
  }

  /**
   * Facade of homefront fetch function.
   *
   * @param toFetch
   * @return {any}
   */
  public fetch(...toFetch): any {
    return this.config.fetch(...toFetch);
  }

  public fetchOrError(...toFetch): any {
    const result = this.fetch(...toFetch);

    if (!result) {
      throw new Error(`Could not find config for \`${toFetch[0]}\`.`);
    }

    return result;
  }
}

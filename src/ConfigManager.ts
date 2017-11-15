import * as path from 'path';

import {Homefront} from 'homefront';

import {transports as winstonTransports} from 'winston';

import * as include from 'include-all';

export class ConfigManager {

  /**
   * Where the application lives.
   *
   * For the moment there should be no way to override it.
   *
   * @TODO: consider ways to make this overridable via loading arguments
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
      transports: [new winstonTransports.Console()]
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
}

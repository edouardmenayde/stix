import {Stix} from './Stix';

import {Entity as WetlandEntity, EntityCtor, EntityInterface} from 'wetland';

import {LoggerInstance} from 'winston';
import * as include from 'include-all';
import * as path from 'path';
import {Homefront} from 'homefront';
import {ConfigManager} from './ConfigManager';
import {Entity} from './Entity';
import {Controller} from './Controller';
import {ServiceInterface} from './ServiceInterface';

export class ModuleConfig {
  public config: Homefront;
  public entities: Map<string, Entity>;
  public controllers: Map<string, Controller>;
  public services: Map<string, ServiceInterface>;
}

export class Module {
  private config: Homefront;
  private entities: Map<string, Entity>;
  private controllers: Map<string, Controller>;
  private services: Map<string, ServiceInterface>;

  constructor(config: ModuleConfig) {
    this.config      = config.config;
    this.entities    = config.entities;
    this.controllers = config.controllers;
    this.services    = config.services;
  }

  getEntities(): Map<string, Entity> {
    return this.entities;
  }
}

class ModuleFactory {
  private logger: LoggerInstance;
  private config: ConfigManager;

  constructor(logger: LoggerInstance, config: ConfigManager) {
    this.logger = logger;
    this.config = config;
  }

  public getModule(moduleName: string): void | Module {
    this.logger.verbose('Trying to load module %s', moduleName);

    const appRelativePath = path.resolve(this.config.applicationPath, moduleName);
    const nodeModulePath  = path.resolve(this.config.applicationPath, 'node_modules', moduleName);

    // What goes below needs to be rewritten into two methods...

    let moduleConfig;
    let modulePath = appRelativePath;

    moduleConfig = include({
      dirname : path.resolve(modulePath, 'config'),
      filter  : /(.+)\.js/,
      optional: true,
    });

    if (!moduleConfig) {
      this.logger.silly('Could not load module %s in %s (application relative path)', moduleName, modulePath);

      modulePath   = nodeModulePath;
      moduleConfig = include({
        dirname : path.resolve(modulePath, 'config'),
        filter  : /(.+)\.js/,
        optional: true,
      });
    }

    if (!moduleConfig) {
      this.logger.silly('Could not load module %s in %s (application node modules\' relative path)', moduleName, modulePath);

      this.logger.error('Could not load module %s, go into silly more to investigate why', moduleName); // clearly a
      // bad debugging experience if it does that...

      return;
    }

    // Whoa it loaded

    const entities = include({
      dirname : path.resolve(modulePath, 'entity'),
      filter  : /(.+)\.js/,
      optional: true,
    });

    const controllers = include({
      dirname : path.resolve(modulePath, 'controller'),
      filter  : /(.+)\.js/,
      optional: true,
    });

    const services = include({
      dirname : path.resolve(modulePath, 'service'),
      filter  : /(.+)\.js/,
      optional: true,
    });

    const module = new Module({
      config     : new Homefront(moduleConfig),
      entities   : new Map(Object.entries(entities)),
      controllers: new Map(Object.entries(controllers)),
      services   : new Map(Object.entries(services))
    });

    this.logger.info('Successfully loaded module `%s`', moduleName);

    return module;
  }
}

export class ModuleManager {
  private stix: Stix;
  private logger: LoggerInstance;
  private config: ConfigManager;
  private modules: Map<string, Module>;
  private moduleFactory: ModuleFactory;

  constructor(stix: Stix) {
    this.stix          = stix;
    this.logger        = this.stix.getLogger();
    this.config        = stix.getConfigManager();
    this.modules       = new Map();
    this.moduleFactory = new ModuleFactory(this.logger, this.config);
  }

  public loadModules() {
    const modules = this.config.fetch('modules');

    if (!modules.length) {
      return this.logger.info('There are no modules to load');
    }

    this.logger.info('Loading Modules...');

    modules.forEach(moduleName => {
      if (this.modules.has(moduleName)) {
        return this.logger.error('Trying to load module %s, but a module with the same name is already loaded');
      }

      const module = this.moduleFactory.getModule(moduleName);

      if (module) {
        this.modules.set(moduleName, module);
      }
    });
  }

  public getModules(): Map<string, Module> {
    return this.modules;
  }
}

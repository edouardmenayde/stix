import * as express from 'express';
import {Stix} from '../Stix';
import {RequestResolver} from '../RequestResolver';
import {EventEmitter} from 'events';
import {Express} from 'express';
import {ConfigManager} from '../ConfigManager';
import {ModuleManager} from '../ModuleManager';
import {LoggerInstance} from 'winston';
import Debug from 'debug';

import {find} from '../Blueprints';

const debug = Debug('stix:rest-request-resolver');

export class RestRequestResolver extends RequestResolver {

  private eventEmitter: EventEmitter;
  private configManager: ConfigManager;
  private moduleManager: ModuleManager;
  private logger: LoggerInstance;
  private mountpoint: string;
  private stix: Stix;
  private app: Express;

  private loadConfig() {
    this.mountpoint = this.configManager.fetchOrError('rest.mountpoint');
  }

  private mountAllModulesEntity() {
    const modules     = this.moduleManager.getModules();
    const wetlandHook = this.stix.getHook('wetland-hook');

    modules.forEach((module, moduleName) => {
      debug('Loading %O', module);
      const subApp = express();
      module.getEntities().forEach((entity, entityName) => {
        const mountPath = entityName.toLowerCase() === moduleName.toLowerCase() ? '/' : `/${entityName}`;
        this.logger.verbose('Mounting %s on subapp %s on %s', entityName, moduleName, mountPath);
        subApp.get(mountPath, (req, res) => find(this.stix, entityName, req, res));
        // subApp.get(mountPath, (req, res) => {
        //   const manager    = wetlandHook['getWetland']().getManager();
        //   const repository = manager.getRepository(manager.getEntity(entityName) as EntityCtor<EntityInterface>);
        //
        //   repository.find()
        //     .then(results => {
        //       console.log(results)
        //       res.set(200);
        //       res.json(results);
        //     })
        //     .catch(error => {
        //       res.set(500);
        //       res.json(error);
        //     })
        // });
      });
      this.logger.verbose('Mounting %s subapp on %s', moduleName, `/${moduleName}`);
      this.app.use(`/${moduleName}`, subApp);
    });
  }

  constructor(stix: Stix) {
    super();

    this.eventEmitter  = stix.getEventEmitter();
    this.configManager = stix.getConfigManager();
    this.moduleManager = stix.getModuleManager();
    this.logger        = stix.getLogger();
    this.stix          = stix;
    this.app           = express();

    const eventName = 'hook:http-request-resolver:loaded';
    this.eventEmitter.on(eventName, httpRequestResolver => {
      this.logger.verbose('Event %s received', eventName);
      this.loadConfig();
      this.mountAllModulesEntity();
      httpRequestResolver.registerAppOn(this.mountpoint, this.app);
    });
  }
}

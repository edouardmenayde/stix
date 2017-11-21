import {EntityCtor, EntityInterface, Wetland} from 'wetland';
import {ModuleManager} from '../ModuleManager';
import {Hook} from '../Hook';
import {ConfigManager} from '../ConfigManager';
import {Stix} from '../Stix';
import * as Bluebird from 'bluebird';

export class WetlandHook extends Hook {

  private wetland: Wetland;
  private moduleManager: ModuleManager;
  private configManager: ConfigManager;

  constructor(stix: Stix) {
    super();

    this.moduleManager = stix.getModuleManager();
    this.configManager = stix.getConfigManager();
  }

  public getWetland(): Wetland {
    return this.wetland;
  }

  public onLoad(): Bluebird<any> {
    console.log(this.configManager.fetch('wetland'));
    this.wetland  = new Wetland(this.configManager.fetchOrError('wetland'));
    const modules = this.moduleManager.getModules();

    modules.forEach((module) => {
      module.getEntities().forEach((entity) => {
        this.wetland.registerEntity(entity as EntityCtor<EntityInterface>);
      });
    });

    return this.wetland.getMigrator().devMigrations(false);
  }
}

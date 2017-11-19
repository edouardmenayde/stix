import {EntityCtor, EntityInterface, Wetland} from 'wetland';
import {ModuleManager} from './ModuleManager';
import {Hook} from './Hook';
import {ConfigManager} from './ConfigManager';
import {Stix} from './Stix';

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

  public onLoad() {
    this.wetland  = new Wetland(this.configManager.fetch('wetland'));
    const modules = this.moduleManager.getModules();

    modules.forEach((module) => {
      module.getEntities().forEach((entity) => {
        this.wetland.registerEntity(entity as EntityCtor<EntityInterface>);
      });
    });
  }
}

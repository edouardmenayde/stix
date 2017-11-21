import * as Bluebird from 'bluebird';
import {ModuleManager} from './ModuleManager';
import {ConfigManager} from './ConfigManager';
import {Logger} from './Logger';
import {EventEmitter} from 'events';
import {LoggerInstance} from 'winston';
import {HttpRequestResolver} from './RequestResolvers/HttpRequestResolver';
import {HookInterface} from './Hook';
import {WetlandHook} from './WetlandHook';
import {RestRequestResolver} from './RestRequestResolver';

export class Stix {
  private moduleManager: ModuleManager;
  private logger: Logger;
  private configManager: ConfigManager;

  private eventEmitter: EventEmitter;
  private hooks: Map<string, HookInterface>;

  /**
   * Creates a Stix instance.
   *
   * @param {Object} configOverride
   */
  constructor(configOverride?: Object) {
    this.configManager = new ConfigManager(configOverride);

    this.logger        = new Logger(this);
    this.moduleManager = new ModuleManager(this);
    this.eventEmitter  = new EventEmitter();
    this.hooks         = new Map();
  }

  public emit(eventName: string, ...args) {
    this.getLogger().verbose('Event `%s` emitted', eventName);
    return this.eventEmitter.emit(eventName, ...args);
  }

  /**
   * Get hook.
   *
   * @param {string} hookName
   */
  public getHook(hookName: string): HookInterface | never {
    const hook = this.hooks.get(hookName);

    if (!hook) {
      throw new Error(`Could not find ${hookName}.`);
    }

    return hook;
  }

  /**
   * Get the config manager.
   *
   * @return {ConfigManager}
   */
  public getConfigManager() {
    return this.configManager;
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
   * Get module manager.
   *
   * @return {ModuleManager}
   */
  public getModuleManager(): ModuleManager {
    return this.moduleManager;
  }

  public getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }


  /**
   * Load the app.
   */
  public load(): Bluebird<Stix> {
    this.moduleManager.loadModules();

    this.hooks.set('http-request-resolver', new HttpRequestResolver(this));
    this.hooks.set('rest-request-resolver', new RestRequestResolver(this));
    this.hooks.set('wetland-hook', new WetlandHook(this));

    const promises = [];

    this.hooks.forEach(hook => promises.push(hook.onLoad()));

    return Bluebird.all(promises)
      .then(() => {
        return this;
      });
  }

  /**
   * Lift the app.
   *
   * @return {Bluebird<Stix>}
   */
  public lift(): Bluebird<Stix> {
    return this.load()
      .then(() => {
        const promises = [];

        this.hooks.forEach(hook => promises.push(hook.onLift()));

        return Bluebird.all(promises);
      })
      .then(() => {
        return this;
      });
  }

  /**
   * Lower the app.
   *
   * @return {Bluebird<(void | Error)[]>}
   */
  public lower(): Bluebird<(void | Error)[]> {

    const promises = [];

    this.hooks.forEach(hook => promises.push(hook['onLift']()));

    return Bluebird.all(promises);
  }
}

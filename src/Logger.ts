import {Logger as WinstonLogger, LoggerInstance, ProfileHandler, LogCallback} from 'winston';
import {Stix} from './Stix';

export class Logger {

  private stix: Stix;
  private winston: LoggerInstance;

  public getWinston(): LoggerInstance {
    return this.winston;
  }

  constructor(stix) {
    this.stix    = stix;
    this.winston = new WinstonLogger(this.stix.getConfigManager().fetch('logging'));
  }
}

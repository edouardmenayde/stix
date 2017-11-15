import * as express from 'express';
import {Express} from 'express';

export class RestRequestResolver implements RequestResolverInterface {

  private app: Express;

  constructor() {
    this.app = express();
  }

}

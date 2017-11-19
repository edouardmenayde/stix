import * as express from 'express';
import {HttpRequestResolver} from './HttpRequestResolver';
import {Stix} from '../Stix';

export class GraphQLRequestResolver extends HttpRequestResolver {
  constructor(stix: Stix) {
    super(stix);

    this.app = express();
  }
}

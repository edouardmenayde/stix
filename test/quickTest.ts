import {Stix} from '../src';
import * as path from 'path';

const stix = new Stix({
  applicationPath: path.resolve(process.cwd(), 'test', 'resources', 'scaffolding'),
  logging        : {
    level: 'silly'
  }
});

stix.lift()
  .catch(error => {
    console.error(error);
  });

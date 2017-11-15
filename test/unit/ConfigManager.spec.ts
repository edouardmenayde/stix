import {expect} from 'chai';

import * as path from 'path';

import {Stix} from '../../src';

describe('ConfigManager', () => {

  it('Should correctly load config', () => {
    const stix = new Stix({
      applicationPath: path.resolve(process.cwd(), 'test', 'resources', 'scaffolding')
    });

    expect(stix.getConfigManager().fetch('modules')).to.eql(['cart']);
  });

});

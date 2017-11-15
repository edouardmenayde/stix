import {expect} from 'chai';
import * as path from 'path';
import {Stix} from '../../src';

describe('Stix', () => {
  describe('Stix::Instantiate', () => {
    it('Should instantiate without argument', () => {
      const stix = new Stix();
    });
    it('Should instantiate with an argument', () => {
      const stix = new Stix({
        sth: 'John'
      });
    });
  });

  describe('Stix::Lift', () => {
    it('Should lift stix', async () => {
      const stix = new Stix({
        applicationPath: path.resolve(process.cwd(), 'test', 'resources', 'scaffolding')
      });

      const app = await stix.load();

      expect(app).to.be.instanceOf(Stix);
    });
  });
});

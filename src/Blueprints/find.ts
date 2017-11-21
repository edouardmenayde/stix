import {EntityCtor, EntityInterface} from 'wetland';

export const find = (stix, entityName, req, res) => {
  const manager    = stix.getHook('wetland-hook')['getWetland']().getManager();
  const repository = manager.getRepository(manager.getEntity(entityName) as EntityCtor<EntityInterface>);

  repository.find()
    .then(results => {
      res.set(200);
      res.json(results);
    })
    .catch(error => {
      res.set(500);
      res.json(error);
    })
};

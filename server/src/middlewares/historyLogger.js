import historyService from '../services/historyService.js';

export const historyLogger = (action, entity) => async (req, res, next) => {
  res.on('finish', async () => {

    if (res.statusCode >= 200 && res.statusCode < 300) {
      let entityId = null;
      if (action === 'create' && res.locals && res.locals.newEntityId) {
        entityId = res.locals.newEntityId;
      } else {
        entityId = req.params.id || (res.locals && res.locals.entityId);
      }

      await historyService.add({
        userId: req.user.id,
        action,
        entity,
        entityId: entityId ? +entityId : null,
      });
    }
  });
  next();
}; 
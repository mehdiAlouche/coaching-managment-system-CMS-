import { Router } from 'express';
import { ActivityController } from '../../modules/activity/controller/activityController';
import { requireAuth } from '../../middleware/auth';

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// Activity feed endpoints
router.get('/activity', ActivityController.getActivities);
router.get('/activity/stats', ActivityController.getActivityStats);

export default router;

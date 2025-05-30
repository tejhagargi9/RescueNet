// backend/routes/sosRoutes.js
import express from 'express';
import {
  triggerSOS,
  getVolunteerSOSAlerts,
  updateSOSAlertResponse,
} from '../controllers/sosController.js'; // Make sure this path is correct
import { protectWithClerk, authorize } from '../middleware/authMiddleware.js'; // <= USE REAL MIDDLEWARE

const router = express.Router();

router.post('/trigger', protectWithClerk, authorize('citizen'), triggerSOS);
router.get('/volunteer-alerts', protectWithClerk, authorize('volunteer'), getVolunteerSOSAlerts);
router.put('/alerts/:alertId/response', protectWithClerk, authorize('volunteer'), updateSOSAlertResponse);

export default router;
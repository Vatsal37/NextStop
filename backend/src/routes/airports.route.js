import { Router } from 'express';
import { listAirports } from '../controllers/airports.controller.js';

const router = Router();

router.get('/', listAirports);

export default router;




import { Router } from "express";
import { getLocationById, getTimesheet, updateTimesheet } from "../controllers/index.js";

const route = Router();

route.patch('/updateCount', updateTimesheet);

route.get('/:id', getLocationById);

route.get('/timesheet/:id', getTimesheet);

export { route as locationRoutes };

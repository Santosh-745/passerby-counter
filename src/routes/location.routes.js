import { Router } from "express";
import { getLocationById, getTimesheet, increamentCount } from "../controllers/index.js";

const route = Router();

route.patch('/updateCount', increamentCount);

route.get('/:id', getLocationById);

route.get('/timesheet/:id', getTimesheet);

export { route as locationRoutes };

import express from "express";
import cors from 'cors';

import { port } from './config/index.js';
import { locationRoutes } from "./routes/location.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/location', locationRoutes);

app.listen(3000, () => {
    console.log(`Server is running on port: ${port}!`);
});

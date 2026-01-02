import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './src/config/database.js';
import routes from './src/routes/reportRoutes.js';
import { errorHandlingMiddleware } from './src/middlewares/errorHandlingMiddleware.js';
import verifyToken from './src/middlewares/authMiddleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/', verifyToken, routes);
app.use(errorHandlingMiddleware);

app.listen(process.env.PORT, () =>
  console.log(` Report Service running on Port ${process.env.PORT}`)
);

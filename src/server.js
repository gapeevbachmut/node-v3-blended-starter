import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { errors } from 'celebrate';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectMongoDB } from './db/connectMongoDB.js';
import productsRoutes from './routes/productsRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

const PORT = process.env.PORT ?? 3000;

app.use(logger);
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cookieParser());

app.use(authRoutes);
app.use(productsRoutes);

app.use(notFoundHandler); // 404
app.use(errors()); // обробка помилок від celebrate (валідація)
app.use(errorHandler); // глобальна обробка інших помилок

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

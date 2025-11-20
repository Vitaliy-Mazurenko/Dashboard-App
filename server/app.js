import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { sequelize } from './src/db/db.js';
import { PORT } from './src/utils/env.js';
import HttpError from './src/utils/HttpError.js';
import authRoutes from './src/routes/auth.js';
import protectedRoutes from './src/routes/protected.js';
import userRoutes from './src/routes/users.js';
import companyRoutes from './src/routes/companies.js';
import historyRoutes from './src/routes/history.js';
import dashboardRoutes from './src/routes/dashboard.js';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Company Dashboard API',
      version: '1.0.0',
      description: 'API documentation for Company Dashboard App',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/db/models/*.js', './src/docs/swagger.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Подключение роутов
app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);
app.use('/users', userRoutes);
app.use('/companies', companyRoutes);
app.use('/history', historyRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/uploads', express.static(path.resolve('uploads')));

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  }); 
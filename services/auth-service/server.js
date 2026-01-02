const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/authRoutes');
const app = express();
const { errorHandlingMiddleware } = require('./src/middlewares/errorHandlingMiddleware');

app.use(cors());
app.use(express.json());
app.use('/', routes);
app.use(errorHandlingMiddleware);
const sequelize = require('./src/config/database');
require('dotenv').config();

sequelize.sync({ alter: true }).then(() => {
    app.listen(process.env.PORT, () => console.log(` Auth Service running on Port ${process.env.PORT}`));
});
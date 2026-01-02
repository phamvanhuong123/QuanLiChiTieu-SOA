import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sequelize from "./src/config/database.js";
import routeTransaction from "./src/routes/transactionRoutes.js";
import routeCategories from "./src/routes/categoryRoutes.js";
import routeBudgets from "./src/routes/budgetRoutes.js";
import verifyToken from "./src/middlewares/authMiddleware.js";
import errorHandlingMiddleware from "./src/middlewares/errorHandlingMiddleware.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Middleware xác thực JWT
app.use("/transactions", verifyToken, routeTransaction);
app.use("/categories", verifyToken, routeCategories);
app.use("/budgets", verifyToken, routeBudgets);


app.use(errorHandlingMiddleware);

sequelize.sync({ alter: true }).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(` Core Service running on Port ${process.env.PORT}`);
  });
});

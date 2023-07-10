import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";

import { UserController, DealershipController } from "./controllers";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/mydb";

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userController = new UserController();
const dealershipController = new DealershipController();

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const client = new MongoClient(MONGODB_URL);

app.post("/users/login", userController.login);
app.post("/users/logout", authenticateUser, userController.logout);
app.post(
  "/users/change-password",
  authenticateUser,
  userController.changePassword
);
app.get("/users/cars", userController.getAllCars);
app.get("/users/cars/:dealershipId", userController.getCarsByDealership);
app.get("/users/dealerships/:carId", userController.getDealershipsByCar);
app.get("/users/vehicles", authenticateUser, userController.getOwnedVehicles);
app.get(
  "/users/dealerships/nearby",
  authenticateUser,
  userController.getDealershipsByLocation
);
app.get("/users/deals/:carId", userController.getDealsOnCar);
app.get(
  "/users/deals/dealership/:dealershipId",
  userController.getDealsByDealership
);
app.post("/users/buy-car", authenticateUser, userController.buyCar);

app.get("/dealerships/:dealershipId/cars", dealershipController.getAllCars);
app.get(
  "/dealerships/:dealershipId/sold-cars",
  dealershipController.getSoldCars
);
app.post(
  "/dealerships/:dealershipId/add-car",
  authenticateUser,
  dealershipController.addCar
);
app.get("/dealerships/:dealershipId/deals", dealershipController.getDeals);
app.post(
  "/dealerships/:dealershipId/add-deal",
  authenticateUser,
  dealershipController.addDeal
);
app.get(
  "/dealerships/:dealershipId/sold-vehicles",
  dealershipController.getSoldVehicles
);
app.post(
  "/dealerships/:dealershipId/add-sold-vehicle",
  authenticateUser,
  dealershipController.addSoldVehicle
);

client.connect((err) => {
  if (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }

  app.locals.db = client.db();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

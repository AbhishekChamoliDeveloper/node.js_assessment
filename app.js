const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

const { UserController, DealershipController } = require("./controllers");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URL =
  "mongodb+srv://abhishekchamoli007:12345678910@cluster0.epijsjg.mongodb.net/";

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

const connectToMongoDB = async () => {
  try {
    const client = new MongoClient(MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const db = client.db();
    app.locals.db = db;

    const userController = new UserController(app.locals.db);
    const dealershipController = new DealershipController(app.locals.db);

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
    app.get(
      "/users/vehicles",
      authenticateUser,
      userController.getOwnedVehicles
    );
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

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB Atlas:", error);
    process.exit(1);
  }
};

connectToMongoDB();

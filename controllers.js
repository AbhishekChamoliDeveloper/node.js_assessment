const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { fakerDE: faker } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");

class UserController {
  constructor(db) {
    this.SALT_ROUNDS = 10;
    this.db = db;
  }

  async login(req, res) {
    const { email, password } = req.body;
    const user = await this.db
      .collection("user")
      .findOne({ user_email: email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ email: user.user_email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).json({ token });
  }

  logout(req, res) {
    res.status(200).json({ message: "Logged out successfully" });
  }

  async changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const user = await this.db
      .collection("user")
      .findOne({ user_email: req.user.email });

    if (!user || !bcrypt.compareSync(oldPassword, user.password)) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, this.SALT_ROUNDS);
    await this.db
      .collection("user")
      .updateOne(
        { user_email: req.user.email },
        { $set: { password: hashedPassword } }
      );

    res.status(200).json({ message: "Password changed successfully" });
  }

  async getAllCars(req, res) {
    const cars = await this.db.collection("cars").find().toArray();
    res.status(200).json({ cars });
  }

  async getCarsByDealership(req, res) {
    const { dealershipId } = req.params;
    const cars = await this.db
      .collection("cars")
      .find({ dealership_id: dealershipId })
      .toArray();
    res.status(200).json({ cars });
  }

  async getDealershipsByCar(req, res) {
    const { carId } = req.params;
    const dealerships = await this.db
      .collection("dealership")
      .find({ cars: carId })
      .toArray();
    res.status(200).json({ dealerships });
  }

  async getOwnedVehicles(req, res) {
    const user = await this.db
      .collection("user")
      .findOne({ user_email: req.user.email });
    const vehicles = await this.db
      .collection("sold_vehicles")
      .find({ vehicle_id: { $in: user.vehicle_info } })
      .toArray();
    res.status(200).json({ vehicles });
  }

  async getDealershipsByLocation(req, res) {
    const user = await this.db
      .collection("user")
      .findOne({ user_email: req.user.email });
    const { latitude, longitude } = req.query;
    const nearbyDealerships = await this.db
      .collection("dealership")
      .find({
        dealership_location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: 10000,
          },
        },
      })
      .toArray();
    res.status(200).json({ dealerships: nearbyDealerships });
  }

  async getDealsOnCar(req, res) {
    const { carId } = req.params;
    const deals = await this.db
      .collection("deal")
      .find({ car_id: carId })
      .toArray();
    res.status(200).json({ deals });
  }

  async getDealsByDealership(req, res) {
    const { dealershipId } = req.params;
    const deals = await this.db
      .collection("deal")
      .find({ dealership_id: dealershipId })
      .toArray();
    res.status(200).json({ deals });
  }

  async buyCar(req, res) {
    const user = await this.db
      .collection("user")
      .findOne({ user_email: req.user.email });
    const { dealId } = req.body;
    const deal = await this.db.collection("deal").findOne({ deal_id: dealId });

    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    await this.db
      .collection("user")
      .updateOne(
        { user_email: req.user.email },
        { $push: { vehicle_info: deal.car_id } }
      );

    await this.db.collection("sold_vehicles").insertOne({
      vehicle_id: await uuidv4(),
      car_id: deal.car_id,
      vehicle_info: {},
    });

    res.status(200).json({ message: "Car purchased successfully" });
  }
}

class DealershipController {
  constructor(db) {
    this.db = db;
  }

  async getAllCars(req, res) {
    const { dealershipId } = req.params;
    const dealership = await this.db
      .collection("dealership")
      .findOne({ dealership_id: dealershipId });

    if (!dealership) {
      return res.status(404).json({ message: "Dealership not found" });
    }

    const cars = await this.db
      .collection("cars")
      .find({ car_id: { $in: dealership.cars } })
      .toArray();
    res.status(200).json({ cars });
  }

  async getSoldCars(req, res) {
    const { dealershipId } = req.params;
    const dealership = await this.db
      .collection("dealership")
      .findOne({ dealership_id: dealershipId });

    if (!dealership) {
      return res.status(404).json({ message: "Dealership not found" });
    }

    const soldVehicles = await this.db
      .collection("sold_vehicles")
      .find({ vehicle_id: { $in: dealership.sold_vehicles } })
      .toArray();

    const soldCars = await this.db
      .collection("cars")
      .find({ car_id: { $in: soldVehicles.map((v) => v.car_id) } })
      .toArray();
    res.status(200).json({ cars: soldCars });
  }

  async addCar(req, res) {
    const { dealershipId } = req.params;
    const dealership = await this.db
      .collection("dealership")
      .findOne({ dealership_id: dealershipId });

    if (!dealership) {
      return res.status(404).json({ message: "Dealership not found" });
    }

    const { carId } = req.body;
    const car = await this.db.collection("cars").findOne({ car_id: carId });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    await this.db
      .collection("dealership")
      .updateOne({ dealership_id: dealershipId }, { $push: { cars: carId } });

    res.status(200).json({ message: "Car added successfully" });
  }

  async getDeals(req, res) {
    const { dealershipId } = req.params;
    const dealership = await this.db
      .collection("dealership")
      .findOne({ dealership_id: dealershipId });

    if (!dealership) {
      return res.status(404).json({ message: "Dealership not found" });
    }

    const deals = await this.db
      .collection("deal")
      .find({ deal_id: { $in: dealership.deals } })
      .toArray();
    res.status(200).json({ deals });
  }

  async addDeal(req, res) {
    const { dealershipId } = req.params;
    const dealership = await this.db
      .collection("dealership")
      .findOne({ dealership_id: dealershipId });

    if (!dealership) {
      return res.status(404).json({ message: "Dealership not found" });
    }

    const { carId, dealInfo } = req.body;
    const car = await this.db.collection("cars").findOne({ car_id: carId });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const dealId = await uuidv4();
    await this.db.collection("deal").insertOne({
      deal_id: dealId,
      car_id: carId,
      deal_info: dealInfo,
    });

    await this.db
      .collection("dealership")
      .updateOne({ dealership_id: dealershipId }, { $push: { deals: dealId } });

    res.status(200).json({ message: "Deal added successfully" });
  }

  async getSoldVehicles(req, res) {
    const { dealershipId } = req.params;
    const dealership = await this.db
      .collection("dealership")
      .findOne({ dealership_id: dealershipId });

    if (!dealership) {
      return res.status(404).json({ message: "Dealership not found" });
    }

    const soldVehicles = await this.db
      .collection("sold_vehicles")
      .find({ vehicle_id: { $in: dealership.sold_vehicles } })
      .toArray();
    res.status(200).json({ soldVehicles });
  }

  async addSoldVehicle(req, res) {
    const { dealershipId } = req.params;
    const dealership = await this.db
      .collection("dealership")
      .findOne({ dealership_id: dealershipId });

    if (!dealership) {
      return res.status(404).json({ message: "Dealership not found" });
    }

    const { carId, vehicleInfo } = req.body;
    const car = await this.db.collection("cars").findOne({ car_id: carId });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const vehicleId = await uuidv4();
    await this.db.collection("sold_vehicles").insertOne({
      vehicle_id: vehicleId,
      car_id: carId,
      vehicle_info: vehicleInfo,
    });

    await this.db
      .collection("dealership")
      .updateOne(
        { dealership_id: dealershipId },
        { $push: { sold_vehicles: vehicleId } }
      );

    res.status(200).json({ message: "Sold vehicle added successfully" });
  }
}

module.exports = {
  UserController,
  DealershipController,
};

# Code Documentation

## Dependencies

- express: A minimal and flexible Node.js web application framework used for building web applications and APIs.
- dotenv: A module that loads environment variables from a .env file into process.env.
- morgan: A middleware that logs HTTP requests' details for development purposes.
- body-parser: A middleware that parses incoming request bodies in JSON format.
- jsonwebtoken (jwt): A library for generating and verifying JSON Web Tokens (JWTs).
- mongodb (MongoClient): A MongoDB driver for Node.js that allows interaction with MongoDB databases.

## Configuration

The code uses environment variables to configure certain settings. It utilizes the `dotenv` library to load the variables from a `.env` file into `process.env`. The following variables are used:

- `PORT`: The port number on which the server will listen. Defaults to 3000 if not provided.
- `MONGODB_URL`: The URL for connecting to the MongoDB database. Defaults to "mongodb://localhost:27017/mydb" if not provided.

## Express Setup

The code imports the required modules and sets up an Express application using the `express()` function. It assigns the created app to the `app` constant.

## Middleware Setup

The following middleware functions are added to the Express application using the `app.use()` method:

- `morgan`: This middleware logs HTTP requests' details in the development format.
- `body-parser`: This middleware parses incoming request bodies in JSON format.
  - `json()` function is used to parse JSON bodies.
  - `urlencoded()` function is used to parse URL-encoded bodies with extended mode enabled.

## Controllers

The code includes two classes: `UserController` and `DealershipController`. These classes encapsulate various endpoints' functionality related to user actions and dealership actions, respectively.

### UserController

#### Constructor

- `SALT_ROUNDS`: The number of rounds to use when generating bcrypt password hashes. Set to 10.
- `db`: The database object used for database operations.

#### Methods

- `login(req, res)`: Handles the user login functionality.
- `logout(req, res)`: Handles the user logout functionality.
- `changePassword(req, res)`: Handles the password change functionality for users.
- `getAllCars(req, res)`: Retrieves all cars from the database.
- `getCarsByDealership(req, res)`: Retrieves cars associated with a specific dealership.
- `getDealershipsByCar(req, res)`: Retrieves dealerships that have a specific car in their inventory.
- `getOwnedVehicles(req, res)`: Retrieves vehicles owned by the authenticated user.
- `getDealershipsByLocation(req, res)`: Retrieves nearby dealerships based on the user's location.
- `getDealsOnCar(req, res)`: Retrieves deals available for a specific car.
- `getDealsByDealership(req, res)`: Retrieves deals associated with a specific dealership.
- `buyCar(req, res)`: Handles the car purchase functionality for users.

### DealershipController

#### Constructor

- `db`: The database object used for database operations.

#### Methods

- `getAllCars(req, res)`: Retrieves all cars associated with a specific dealership.
- `getSoldCars(req, res)`: Retrieves sold cars associated with a specific dealership.
- `addCar(req, res)`: Adds a car to a specific dealership's inventory.
- `getDeals(req, res)`: Retrieves deals associated with a specific dealership.
- `addDeal(req, res)`: Adds a deal to a specific dealership's deals.
- `getSoldVehicles(req, res)`: Retrieves sold vehicles associated with a specific dealership.
- `addSoldVehicle(req, res)`: Adds a sold vehicle to a specific dealership's sold vehicles.

## Endpoint Definitions

The code sets up various endpoint routes using the `app.<METHOD>` functions provided by Express. The following endpoints are defined:

- User-related endpoints:

  - `/users/login`: POST endpoint for user login.
  - `/users/logout`: POST endpoint for user logout.
  - `/users/change-password`: POST endpoint for changing the user's password.
  - `/users/cars`: GET endpoint for retrieving all cars.
  - `/users/cars/:dealershipId`: GET endpoint for retrieving cars by dealership.
  - `/users/dealerships/:carId`: GET endpoint for retrieving dealerships by car.
  - `/users/vehicles`: GET endpoint for retrieving owned vehicles.
  - `/users/dealerships/nearby`: GET endpoint for retrieving nearby dealerships.
  - `/users/deals/:carId`: GET endpoint for retrieving deals on a car.
  - `/users/deals/dealership/:dealershipId`: GET endpoint for retrieving deals by dealership.
  - `/users/buy-car`: POST endpoint for purchasing a car.

- Dealership-related endpoints:
  - `/dealerships/:dealershipId/cars`: GET endpoint for retrieving all cars associated with a dealership.
  - `/dealerships/:dealershipId/sold-cars`: GET endpoint for retrieving sold cars associated with a dealership.
  - `/dealerships/:dealershipId/add-car`: POST endpoint for adding a car to a dealership's inventory.
  - `/dealerships/:dealershipId/deals`: GET endpoint for retrieving deals associated with a dealership.
  - `/dealerships/:dealershipId/add-deal`: POST endpoint for adding a deal to a dealership's deals.
  - `/dealerships/:dealershipId/sold-vehicles`: GET endpoint for retrieving sold vehicles associated with a dealership.
  - `/dealerships/:dealershipId/add-sold-vehicle`: POST endpoint for adding a sold vehicle to a dealership's sold vehicles.

## MongoDB Connection

The code creates a MongoDB client using the `MongoClient` class provided by the `mongodb` module. The client connects to the MongoDB database specified by the `MONGODB_URL` environment variable.

If the connection fails, an error message is logged, and the process exits with a status code of 1.

If the connection is successful, the client's database is assigned to the `app.locals.db` property.

## Server Initialization

After establishing the MongoDB connection, the server starts listening on the specified `PORT`. Once the server is running, a log message is displayed indicating the port number.

## Request Examples

Here are examples of requests for each defined endpoint:

- User-related endpoints:

  - **Login**: POST `/users/login`

    ```bash
    curl -X POST \
      -H "Content-Type: application/json" \
      -d '{
        "email": "user@example.com",
        "password": "secretpassword"
      }' \
      http://localhost:3000/users/login
    ```

  - **Logout**: POST `/users/logout`

    ```bash
    curl -X POST \
      -H "Authorization: Bearer <TOKEN>" \
      http://localhost:3000/users/logout
    ```

  - **Change Password**: POST `/users/change-password`

    ```bash
    curl -X POST \
      -H "Authorization: Bearer <TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{

    ```

"oldPassword": "secretpassword",
"newPassword": "newsecretpassword"
}' \
 http://localhost:3000/users/change-password

````

- **Get All Cars**: GET `/users/cars`

  ```bash
  curl -X GET \
    http://localhost:3000/users/cars
````

- **Get Cars by Dealership**: GET `/users/cars/:dealershipId`

  ```bash
  curl -X GET \
    http://localhost:3000/users/cars/<dealershipId>
  ```

- **Get Dealerships by Car**: GET `/users/dealerships/:carId`

  ```bash
  curl -X GET \
    http://localhost:3000/users/dealerships/<carId>
  ```

- **Get Owned Vehicles**: GET `/users/vehicles`

  ```bash
  curl -X GET \
    -H "Authorization: Bearer <TOKEN>" \
    http://localhost:3000/users/vehicles
  ```

- **Get Dealerships by Location**: GET `/users/dealerships/nearby?latitude=<LATITUDE>&longitude=<LONGITUDE>`

  ```bash
  curl -X GET \
    -H "Authorization: Bearer <TOKEN>" \
    "http://localhost:3000/users/dealerships/nearby?latitude=<LATITUDE>&longitude=<LONGITUDE>"
  ```

- **Get Deals on Car**: GET `/users/deals/:carId`

  ```bash
  curl -X GET \
    http://localhost:3000/users/deals/<carId>
  ```

- **Get Deals by Dealership**: GET `/users/deals/dealership/:dealershipId`

  ```bash
  curl -X GET \
    http://localhost:3000/users/deals/dealership/<dealershipId>
  ```

- **Buy Car**: POST `/users/buy-car`

  ```bash
  curl -X POST \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{
      "dealId": "<DEAL_ID>"
    }' \
    http://localhost:3000/users/buy-car
  ```

- Dealership-related endpoints:

  - **Get All Cars**: GET `/dealerships/:dealershipId/cars`

    ```bash
    curl -X GET \
      http://localhost:3000/dealerships/<dealershipId>/cars
    ```

  - **Get Sold Cars**: GET `/dealerships/:dealershipId/sold-cars`

    ```bash
    curl -X GET \
      http://localhost:3000/dealerships/<dealershipId>/sold-cars
    ```

  - **Add Car**: POST `/dealerships/:dealershipId/add-car`

    ```bash
    curl -X POST \
      -H "Authorization: Bearer <TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
        "carId": "<CAR_ID>"
      }' \
      http://localhost:3000/dealerships/<dealershipId>/add-car
    ```

  - **Get Deals**: GET `/dealerships/:dealershipId/deals`

    ```bash
    curl -X GET \
      http://localhost:3000/dealerships/<dealershipId>/deals
    ```

  - **Add Deal**: POST `/dealerships/:dealershipId/add-deal`

    ```bash
    curl -X POST \
      -H "Authorization: Bearer <TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
        "carId": "<CAR_ID>",
        "dealInfo": "<DEAL_INFO>"
      }' \
      http://localhost:3000/dealerships/<dealershipId>/add-deal
    ```

  - **Get Sold Vehicles**: GET `/dealerships/:dealershipId/sold-vehicles`

    ```bash
    curl -X GET \
      http://localhost:3000/dealerships/<dealershipId>/sold-vehicles
    ```

  - **Add Sold Vehicle**: POST `/dealerships/:dealershipId/add-sold-vehicle`
    ```bash
    curl -X POST \
      -H "Authorization: Bearer <TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
        "carId": "<CAR_ID>",
        "vehicleInfo": "<VEHICLE_INFO>"
      }' \
      http://localhost:3000/dealerships/<dealershipId>/add-sold-vehicle
    ```

Please replace `<TOKEN>`, `<DEAL_ID>`, `<LATITUDE>`, `<LONGITUDE>`, `<CAR_ID>`, `<DEAL_INFO>`, and `<VEHICLE_INFO>` with the appropriate values specific to your use case.

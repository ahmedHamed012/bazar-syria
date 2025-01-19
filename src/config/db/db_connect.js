const mongoose = require("mongoose");

class DatabaseConnect {
  constructor() {
    this._connect();
  }
  async _connect() {
    if (this.connection) {
      // Reuse the existing connection
      return this.connection;
    }
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("Database connection successful");
      })
      .catch((err) => {
        console.error("Database connection error:", err);
      });
    this.connection = mongoose.connection;
    this.connection.on("connected", () => {
      console.log("Mongoose connected to the database");
    });
    this.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });
    this.connection.on("disconnected", () => {
      console.log("Mongoose disconnected");
    });
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabaseConnect();
    }
    return this.instance;
  }
}
module.exports = DatabaseConnect.getInstance();

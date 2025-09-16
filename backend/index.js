import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";

const app = express();
const port = process.env.PORT || 5000;

app.listen(port, () => {
    connectDb();
  console.log(`Server is running on port ${port}`);
});
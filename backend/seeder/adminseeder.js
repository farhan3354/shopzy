import bcrypt from "bcrypt";
import connectDB from "../config/db.js";
import AuthModel from "../models/authModel.js";
import dotenv from "dotenv";
dotenv.config();

const AdminSeeder = async () => {
  try {
    await connectDB();

    const adminexist = await AuthModel.findOne({ userRole: "admin" });

    if (adminexist) {
      console.log(" Admin already exists");
    } else {
      const hashedPassword = await bcrypt.hash(process.env.password, 10);

      const user = await AuthModel.create({
        userRole: process.env.role,
        name: process.env.name,
        email: process.env.email,
        phone: process.env.phone,
        password: hashedPassword,
        userStatus: "active",
      });

      console.log("Admin registered successfully");
      console.log(user);
    }
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  }
};

AdminSeeder();

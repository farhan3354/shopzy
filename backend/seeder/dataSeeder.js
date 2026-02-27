import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategory.js";
import Product from "../models/product.js";
import Faq from "../models/Faq.js";
import AuthModel from "../models/authModel.js";
import slugify from "slugify";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // 1. Clear existing data
    console.log("Clearing existing data...");
    await Category.deleteMany();
    await Subcategory.deleteMany();
    await Product.deleteMany();
    await Faq.deleteMany();

    // 2. Get or Create Admin User
    let admin = await AuthModel.findOne({ userRole: "admin" });
    if (!admin) {
      console.log("Admin not found, please run npm run seeder first.");
      process.exit(1);
    }

    // 3. Seed Categories
    console.log("Seeding categories...");
    const categoriesData = [
      { name: "Electronics", description: "Latest gadgets and electronic devices" },
      { name: "Fashion", description: "Trendy clothes and accessories" },
      { name: "Home & Garden", description: "Everything for your home and outdoor spaces" }
    ];

    const createdCategories = await Promise.all(
      categoriesData.map(c => Category.create({ ...c, slug: slugify(c.name, { lower: true }) }))
    );

    // 4. Seed Subcategories
    console.log("Seeding subcategories...");
    const subcategoriesData = [
      { name: "Smartphones", parentCategory: createdCategories[0]._id },
      { name: "Laptops", parentCategory: createdCategories[0]._id },
      { name: "Men's Wear", parentCategory: createdCategories[1]._id },
      { name: "Women's Wear", parentCategory: createdCategories[1]._id },
      { name: "Furniture", parentCategory: createdCategories[2]._id },
      { name: "Kitchen", parentCategory: createdCategories[2]._id }
    ];

    const createdSubcategories = await Promise.all(
      subcategoriesData.map(s => Subcategory.create({ ...s, slug: slugify(s.name, { lower: true }) }))
    );

    // 5. Seed Products
    console.log("Seeding products...");
    const productsData = [
      {
        name: "iPhone 15 Pro",
        price: 999,
        originalPrice: 1099,
        description: "The latest Apple flagship with titanium build.",
        category: createdCategories[0]._id,
        subcategory: createdSubcategories[0]._id,
        stock: 50,
        brand: "Apple",
        userId: admin._id,
        images: ["https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=2070&auto=format&fit=crop"],
        producttype: "physical"
      },
      {
        name: "MacBook Air M2",
        price: 1199,
        originalPrice: 1299,
        description: "Powerful and portable laptop for students and pros.",
        category: createdCategories[0]._id,
        subcategory: createdSubcategories[1]._id,
        stock: 30,
        brand: "Apple",
        userId: admin._id,
        images: ["https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?q=80&w=2070&auto=format&fit=crop"],
        producttype: "physical"
      },
      {
        name: "Classic Leather Jacket",
        price: 199,
        originalPrice: 250,
        description: "Timeless style for everyday wear.",
        category: createdCategories[1]._id,
        subcategory: createdSubcategories[2]._id,
        stock: 100,
        brand: "Marotix",
        userId: admin._id,
        images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop"],
        producttype: "physical"
      },
      {
        name: "Floral Summer Dress",
        price: 49,
        originalPrice: 79,
        description: "Light and airy floral dress for summer days.",
        category: createdCategories[1]._id,
        subcategory: createdSubcategories[3]._id,
        stock: 150,
        brand: "Marotix",
        userId: admin._id,
        images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1946&auto=format&fit=crop"],
        producttype: "physical"
      },
      {
        name: "Ergonomic Office Chair",
        price: 299,
        originalPrice: 399,
        description: "Comfortable chair for long work hours.",
        category: createdCategories[2]._id,
        subcategory: createdSubcategories[4]._id,
        stock: 20,
        brand: "HomePro",
        userId: admin._id,
        images: ["https://images.unsplash.com/photo-1505797149-43b000109ffb?q=80&w=1887&auto=format&fit=crop"],
        producttype: "physical"
      },
      {
        name: "Non-Stick Cookware Set",
        price: 149,
        originalPrice: 199,
        description: "Complete set of high-quality non-stick pans.",
        category: createdCategories[2]._id,
        subcategory: createdSubcategories[5]._id,
        stock: 45,
        brand: "KitchenMaster",
        userId: admin._id,
        images: ["https://images.unsplash.com/photo-1584990344619-390412354898?q=80&w=2070&auto=format&fit=crop"],
        producttype: "physical"
      }
    ];

    await Promise.all(
      productsData.map(p => Product.create({ ...p, slug: slugify(p.name, { lower: true }) }))
    );

    // 6. Seed FAQs
    console.log("Seeding FAQs...");
    const faqsData = [
      { question: "What is your return policy?", answer: "We offer a 30-day return policy on all our products." },
      { question: "How long does shipping take?", answer: "Shipping usually takes 3-5 business days." },
      { question: "Do you ship internationally?", answer: "Yes, we ship to most countries worldwide." },
      { question: "Can I track my order?", answer: "Yes, once your order is shipped, you will receive a tracking link via email." },
      { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, and Razorpay." }
    ];

    await Faq.insertMany(faqsData);

    console.log("Data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error.message);
    process.exit(1);
  }
};

seedData();

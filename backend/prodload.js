require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./ProductSchema.js");

// Change the path if needed
const products = require("../grocery_master_enriched.json");

async function importProducts() {

    try{

        await mongoose.connect(process.env.MONGODBURL);

        console.log("MongoDB Connected");

        // Optional: clear existing products
        // await Product.deleteMany({});

        const newProducts = products.map((product,index)=>{

            return{

                name: product.name,

                brand: product.brand,

                type: product.type,

                subcategory: product.subcategory,

                category: product.category,

                weight: product.weight,

                mrp: Number(product.mrp)||0,

                image_url: product.image_url
            }

        });

        await Product.insertMany(newProducts);

        console.log(`${newProducts.length} Products Imported`);

        mongoose.disconnect();

    }

    catch(err){

        console.log(err);

    }

}

importProducts();
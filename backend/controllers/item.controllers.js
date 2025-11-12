import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";

// Add item
export const addItem = async (req, res) => {
  try {
    const { name, category, price, foodType } = req.body;
    let image;
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "Shop not found. Create shop first." });
    }

    const item = await Item.create({
      name,
      category,
      price,
      foodType,
      image,
      shop: shop._id,
    });

    shop.items.push(item._id);
    await shop.save();
    await shop.populate('owner')
    await shop.populate({ path: "items", options: { sort: { updatedAt: -1 } } });

    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Add item error ${error}` });
  }
};

//  Edit item
export const editItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { name, category, price, foodType } = req.body;
    let image;

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
    }

    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        category,
        price,
        foodType,
        ...(image && { image }), // only update image if provided
      },
      { new: true }
    );

    if (!item) {
      return res.status(400).json({ message: "Item not found" });
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate('owner').populate({ path: "items", options: { sort: { updatedAt: -1 } } });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Edit item error ${error}` });
  }
};

// Get item by ID
export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId); // ✅ fixed: now it's actually called

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    console.log("Fetched item:", item);
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `Get item error ${error}` });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params; // ✅ Correct destructuring

    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }

    // remove item ID from shop.items
    shop.items = shop.items.filter(
      (i) => i.toString() !== item._id.toString()
    );
    await shop.save();

    // repopulate for updated data
    await shop.populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });

    return res.status(200).json(shop);
  } catch (error) {
    console.error("Delete item error:", error);
    return res.status(500).json({ message: `Delete item error ${error}` });
  }
};

export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params;
    if (!city) {
      return res.status(400).json({ message: "City is required" });

    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") }
    }).populate('items')
    if (!shops) {
      return res.status(400).json({ message: "shops not found" })
    }
    const shopIds=shops.map(shop=>shop._id)
    const items=await Item.find({shop:{$in:shopIds}})
    return res.status(200).json(items)
  } catch (error) {
    return res.status(500).json({ message: `Get items by city error ${error}` });
  }
}

export const getItemsByShop=async (req,res) => {
  try {
    
    const {shopId}=req.params;
    const shop = await Shop.findById(shopId).populate('items');
    if (!shop) {
      return res.status(400).json({ message: "Shop not found" });
    }
    return res.status(200).json({shop,items:shop.items});
  } catch (error) {
    return res.status(500).json({ message: `Get items by shop error ${error}` });
  }
  
}

export const searchItems= async (req,res) => {
  try {

    const {query,city}=req.query
    if (!query || !city) {
  return res.status(400).json({ message: "Missing query or city" });
}

    
    const shops = await Shop.find({
      city:{$regex:new RegExp(`^${city}$`,"i")}
    }).populate('items')
    if(!shops){
      return res.status(400).json({message:"Shops not found"})

    }
    const shopIds = shops.map(s=>s._id)
    const items = await Item.find({
      shop:{$in:shopIds},
      $or:[
        {name:{$regex:query,$options:"i"}},
         {category:{$regex:query,$options:"i"}}
      ]
    }).populate("shop","name image")
    return res.status(200).json(items)
  } catch (error) {
    return res.status(500).json({message:`Search Item Error: ${error}`})
  }
  
}
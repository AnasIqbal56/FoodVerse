import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import Item from "../models/item.model.js";
export const createEditShop=async (req,res)=>{
    try{
        const {name,city,state,address}=req.body
       
        let image;
        if(req.file){
            console.log(req.file)
            image=await uploadOnCloudinary(req.file.path)
            console.log(image);
           
           
        }

        let shop=await Shop.findOne({owner:req.userId})
        if(!shop){
          shop=await Shop.create({
            name,city,state,address,owner:req.userId , image : image 
        })
            
        }
        else{
            console.log("else wala")
            shop=await Shop.findByIdAndUpdate(shop._id,{
            name,city,state,address,owner:req.userId, image : image
        },{new:true})
        
        }
        
        
        await shop.populate("owner").populate({path: "items", options: { sort: { updatedAt: -1 }}})
        return res.status(201).json(shop)
    } catch (error){
        return res.status(500).json({message:`create shop error ${error}`})
    }
}


export const getMyShop=async (req,res)=>{
    try{
        const shop=await Shop.findOne({owner:req.userId}).populate("owner items")
        if(!shop){
            return null
        }
        return res.status(200).json(shop)
}
    catch(error){
        return res.status(500).json({message:`Get my shop error ${error}`})
    }
}

// export const getShopByCity= async (req, res) => {
//     try {
//         const {city} =req.params
//         //FIX
//         // Find shops in city, then fetch items and populate the shop field in each item.
//         // This ensures each item object includes `shop` as an object (with _id).
//         const shops = await Shop.find({
//         city: { $regex: new RegExp(`^${city}$`, "i") }
//         });
//         if (!shops || shops.length === 0) {
//         return res.status(200).json([]); // no shops => return empty array of items
//         }
//         const shopIds = shops.map(shop => shop._id);
//         // Fetch items whose shop is in shopIds, and populate the `shop` field
//         const items = await Item.find({ shop: { $in: shopIds } }).populate('shop', '_id name city');

//         return res.status(200).json(items);
//         //

//         // const shops = await Shop.find({
//         //     city:{$regex:new RegExp(`^${city}$`,"i")}
//         // }).populate('items')
//         // if (!shops){
//         //     return res.status(400).json({message:"shops not found"})
//         // } 
//         // return res.status(200).json(shops)
//     } catch (error) {
//         return res.status(500).json({message:`Get shop by city error ${error}`})        
//     } 
// }



export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const shops = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") }
    });

    if (!shops || shops.length === 0) {
      return res.status(200).json({ shops: [], items: [] });
    }

    const shopIds = shops.map(shop => shop._id);
    const items = await Item.find({ shop: { $in: shopIds } })
      .populate('shop', '_id name city');

    return res.status(200).json({ shops, items }); // ✅ send both
  } catch (error) {
    return res.status(500).json({ message: `Get shop by city error ${error}` });
  }
};




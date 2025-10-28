import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
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

export const getShopByCity= async (req, res) => {
    try {
        const {city} =req.params
        const shops = await Shop.find({
            city:{$regex:new RegExp(`^${city}$`,"i")}
        }).populate('items')
        if (!shops){
            return res.status(400).json({message:"shops not found"})
        } 
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({message:`Get shop by city error ${error}`})        
    } 
}
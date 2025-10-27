import uploadOnCloudinary from "../utils/cloudinary.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";

export const addItem=async (req,res)=>{
    try{
        const {name,category,price,foodType}=req.body
        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path)
        }
        const shop=await Shop.findOne({owner:req.userId})
        if(!shop){
            return res.status(400).json({message:"Shop not found. Create shop first."})
        }
        const item=await Item.create({
            name,category,price,foodType,image,shop:shop._id
        })

        shop.items.push(item._id)
        await shop.save()
        await shop.populate("owner items")
    
        return res.status(201).json(shop)

    }catch(error){
        return res.status(500).json({message:`Add item error ${error}`})
    }
}


export const editItem=async (req,res)=>{
    try{
        const itemId=req.params.itemId
        const {name,category,price,foodType}=req.body
        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path)
        }
        const item=await Item.findByIdAndUpdate(itemId,{
            name,category,price,foodType,image
        },{new:true})
        if(!item){
            return res.status(400).json({message:"Item not found"})
        }
        return res.status(200).json(item)

    }catch(error){
        return res.status(500).json({message:`Edit item error ${error}`})
    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findById
        if(!item){
            return res.status(400).json({message:"Item not found"})
        }
        return res.status(200).json(item)
    } catch (error) {
        return res.status(500).json({message:`get item error ${error}`})
        
    }
    
}
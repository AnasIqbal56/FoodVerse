import User from "../models/user.model"
export const getCurrentUser = async (req,res) => {
    try {
        const userId = req.userId
        if(!userId){
            return res.status(400).json({message:"User ID not found"})
        }
        const user = await User.findbyId(userId)
        if(!user){
            return res.status(400).json({message:"User not Found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:"Error in getting Current User"})
        
    }
    
}
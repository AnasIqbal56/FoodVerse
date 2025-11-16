import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs';

const uploadOnCloudinary = async (file) => {
    cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret:process.env.CLOUDINARY_API_SECRET
});

try{
    // Check if file exists before uploading
    if (!fs.existsSync(file)) {
        console.error('File does not exist:', file);
        throw new Error(`File not found: ${file}`);
    }
    
    const result= await cloudinary.uploader.upload(file)
    
    // Delete file after successful upload
    if (fs.existsSync(file)) {
        fs.unlinkSync(file)
    }
    
    return result.secure_url
}
catch (error){
    console.error('Cloudinary upload error:', error)
    
    // Clean up file if it exists
    if (fs.existsSync(file)) {
        fs.unlinkSync(file)
    }
    
    throw error; // Re-throw to let controller handle it
}
}

export default uploadOnCloudinary;

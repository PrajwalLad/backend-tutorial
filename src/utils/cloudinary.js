import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import { ApiError } from './ApiError';

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath) =>{
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: 'auto'});

        console.log("File has been uploaded on cloudinary ", response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteFromCloudinary = async(cloudinaryPath) =>{
    try {
        if(!cloudinaryPath) return null;
        const response = await cloudinary.uploader.destroy(cloudinaryPath, {resource_type: 'auto'});

        console.log("File has been deleted from cloudinary", response);
        return response;
    } catch (error) {
        throw new ApiError(400, "Error deleting the file from cloudinary");
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}
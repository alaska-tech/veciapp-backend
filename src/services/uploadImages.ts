import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

//TODO: poner esta configuracion en .env
cloudinary.config({
    cloud_name: 'gijumi',
    api_key: '374413735465488',
    api_secret: 'xFJfVMfIak8zCxID0lGuR3ItNpg'
});

// Define storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'branches', // Folder in Cloudinary where images will be stored
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Allowed file formats
        //transformation: [{ width: 800, crop: 'limit' }], // Basic transformation
    } as any, // Type assertion due to potential type issues
});

// Define specific storage configurations for different types of uploads
const logoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'branches/logos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        //transformation: [{ width: 400, height: 400, crop: 'fill' }],
    } as any,
});

// Create multer instances with different storage configurations
const upload = multer({ storage });
const logoUpload = multer({ storage: logoStorage });

export class CloudinaryService {
    // Method to upload a single image (logo)
    uploadLogo() {
        return logoUpload.single('logo');
    }

    // Method to upload multiple images
    uploadImages() {
        return upload.array('images', 5); // Maximum 5 images
    }

    // Method to delete an image from Cloudinary
    async deleteImage(publicId: string): Promise<boolean> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result.result === 'ok';
        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
            return false;
        }
    }

    // Method to extract public ID from Cloudinary URL
    extractPublicId(cloudinaryUrl: string): string {
        const matches = cloudinaryUrl.match(/\/v\d+\/(.+?)\.[a-zA-Z0-9]+$/);
        return matches ? matches[1] : '';
    }
}
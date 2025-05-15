import { Request, Response, NextFunction } from 'express';
import { CloudinaryService } from '../services/uploadImages';

const cloudinaryService = new CloudinaryService();

export const handleFileUpload = (req: Request, res: Response, next: NextFunction) => {
    // This middleware processes the uploaded files and makes the URLs available
    // to the actual controller
    if (req.file) {
        // Single file upload (logo)
        req.body.logo = req.file.path;
    }

    if (req.files) {
        if (Array.isArray(req.files)) {
            // Multiple files upload (images)
            req.body.images = req.files.map(file => file.path);
        } else {
            // Handle case where req.files is an object with field names as keys
            const fileArrays = Object.values(req.files);
            if (fileArrays.length > 0) {
                req.body.images = fileArrays.flat().map(file => file.path);
            }
        }
    }

    next();
};

export const uploadLogo = cloudinaryService.uploadLogo();
export const uploadImages = cloudinaryService.uploadImages();

// Middleware to validate image uploads
export const validateImageUpload = (req: Request, res: Response, next: NextFunction) => {
    // Check if file exists for logo upload endpoints
    if (req.path.includes('/upload-logo') && !req.file) {
        return res.status(400).json({ success: false, message: 'No se ha proporcionado una imagen para el logo' });
    }

    // Check if files exist for image upload endpoints
    if (req.path.includes('/upload-images')) {
        const hasNoFiles = !req.files ||
            (Array.isArray(req.files) && req.files.length === 0) ||
            (!Array.isArray(req.files) && Object.keys(req.files).length === 0);

        if (hasNoFiles) {
            return res.status(400).json({
                success: false,
                message: 'No se han proporcionado imágenes para cargar'
            });
        }
    }

    next();
};
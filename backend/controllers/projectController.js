import Project from '../models/Project.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImagesToCloudinary = async (imagesArray) => {
    if (!imagesArray || imagesArray.length === 0) return [];

    const uploadedUrls = await Promise.all(
        imagesArray.map(async (img) => {
            if (img.startsWith('http')) return img;

            const result = await cloudinary.uploader.upload(img, { folder: 'mcm_projects' });
            return result.secure_url;
        })
    );
    return uploadedUrls;
};

export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.images && project.images.length > 0) {
            const deletePromises = project.images.map((imgUrl) => {
                const parts = imgUrl.split('/');
                const filenameWithExt = parts.pop();
                const folder = parts.pop();
                const publicId = `${folder}/${filenameWithExt.split('.')[0]}`;
                return cloudinary.uploader.destroy(publicId);
            });
            await Promise.all(deletePromises);
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project and all associated images deleted successfully' });
    } catch (err) {
        console.error('Delete Error:', err);
        res.status(500).json({ message: 'Failed to delete project' });
    }
};

export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
};

export const createProject = async (req, res) => {
    try {
        // ADDED paymentType & subscriptionCycle
        const { clientName, projectName, status, budget, paymentType, subscriptionCycle, deadline, contacts, address, notes, images } = req.body;

        const imageUrls = await uploadImagesToCloudinary(images);

        const project = new Project({
            clientName, projectName, status, budget, paymentType, subscriptionCycle, deadline,
            contacts, address, notes, images: imageUrls
        });

        await project.save();
        res.status(201).json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create project' });
    }
};

export const updateProject = async (req, res) => {
    try {
        // ADDED paymentType & subscriptionCycle
        const { clientName, projectName, status, budget, paymentType, subscriptionCycle, deadline, contacts, address, notes, images } = req.body;

        const imageUrls = await uploadImagesToCloudinary(images);

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { clientName, projectName, status, budget, paymentType, subscriptionCycle, deadline, contacts, address, notes, images: imageUrls },
            { new: true, runValidators: true }
        );
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update project' });
    }
};
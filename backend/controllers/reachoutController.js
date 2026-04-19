import Reachout from '../models/Reachout.js';

export const getReachouts = async (req, res) => {
    try {
        const attempts = await Reachout.find().sort({ createdAt: -1 });
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch reachout attempts' });
    }
};

export const createReachout = async (req, res) => {
    try {
        const { platform, contactDetail, status, notes } = req.body;

        if (!platform || !contactDetail || !status) {
            return res.status(400).json({ message: 'Platform, Contact Detail, and Status are required' });
        }

        const newAttempt = new Reachout({ platform, contactDetail, status, notes });
        await newAttempt.save();

        res.status(201).json(newAttempt);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to log reachout attempt' });
    }
};

export const updateReachout = async (req, res) => {
    try {
        const { platform, contactDetail, status, notes } = req.body;

        const updatedAttempt = await Reachout.findByIdAndUpdate(
            req.params.id,
            { platform, contactDetail, status, notes },
            { new: true, runValidators: true }
        );

        if (!updatedAttempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }
        res.json(updatedAttempt);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update reachout attempt' });
    }
};

export const deleteReachout = async (req, res) => {
    try {
        const attempt = await Reachout.findByIdAndDelete(req.params.id);
        if (!attempt) {
            return res.status(404).json({ message: 'Attempt not found' });
        }
        res.json({ message: 'Attempt deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete reachout attempt' });
    }
};
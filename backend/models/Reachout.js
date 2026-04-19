import mongoose from 'mongoose';

const reachoutSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true
    },
    contactDetail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    notes: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('MCM-Reachout', reachoutSchema);
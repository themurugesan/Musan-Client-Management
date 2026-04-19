import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    clientName: String,
    projectName: String,
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },

    // NEW PAYMENT FIELDS
    budget: Number,
    paymentType: { type: String, enum: ['One-Time', 'Subscription'], default: 'One-Time' },
    subscriptionCycle: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], default: 'Monthly' },

    deadline: Date,

    contacts: [{
        contactType: String,
        value: String
    }],
    address: String,
    notes: String,
    images: [String]
}, { timestamps: true });

export default mongoose.model('MCM-Project', projectSchema);
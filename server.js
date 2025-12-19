require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("MongoDB Atlas connected");
})
.catch((err) => {
    console.log("MongoDB connection error:", err);
});

const contactSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true },
    message: { type: String, required: true }
});

const Contact = mongoose.model('Contact', contactSchema);

app.get('/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/contacts/:id', async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }
        res.json(contact);
    } catch (err) {
        res.status(400).json({ message: 'Invalid ID' });
    }
});


app.post('/contacts', async (req, res) => {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !email || !message) {
        return res.status(400).json({
            message: 'firstName, email and message are required'
        });
    }

    try {
        const newContact = new Contact({
            firstName,
            lastName,
            email,
            message
        });

        await newContact.save();

        res.status(201).json({
            message: 'Contact saved successfully',
            contact: newContact
        });
    } catch (err) {
        res.status(500).json({ message: 'Error saving contact' });
    }
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

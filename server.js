const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'contacts.json');
app.use(express.static('public')); 
app.use(bodyParser.json()); 
const readContacts = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeContacts = (contacts) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 4), 'utf8');
    } catch (error) {
        console.error("Error writing contacts file:", error);
    }
};
//get all contacts
app.get('/contacts', (req, res) => {
    const contacts = readContacts();
    res.json(contacts);
});

// get a specific contact
app.get('/contacts/:id', (req, res) => {
    const contacts = readContacts();
    const contactId = req.params.id;
    const contact = contacts.find(c => c.id === contactId);

    if (contact) {
        res.json(contact);
    } else {
        res.status(404).json({ message: 'Contact not found' });
    }
});

// post new contact
app.post('/contacts', (req, res) => {
    const contacts = readContacts();
    const newContactData = req.body;
    
    if (!newContactData.firstName || !newContactData.email || !newContactData.message) {
        return res.status(400).json({ message: 'Missing required fields: firstName, email, and message' });
    }
    const lastId = contacts.length > 0 ? contacts[contacts.length - 1].id : 'C000';
    const newIdNumber = parseInt(lastId.substring(1)) + 1;
    const newId = 'C' + newIdNumber.toString().padStart(3, '0');

    const newContact = {
        id: newId,
        firstName: newContactData.firstName,
        lastName: newContactData.lastName || '',
        email: newContactData.email,
        message: newContactData.message
    };

    contacts.push(newContact);
    writeContacts(contacts);

    res.status(201).json({ 
        message: 'Contact successfully created and saved', 
        contact: newContact 
    });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
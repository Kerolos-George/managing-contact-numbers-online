const Contact = require('../models/contact.model');

// Create new contact
exports.createContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    const savedContact = await contact.save();
    res.status(201).json(savedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all contacts with pagination
exports.getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    
    // Filter options
    const filter = {};
    if (req.query.name) filter.name = { $regex: req.query.name, $options: 'i' };
    if (req.query.phone) filter.phone = { $regex: req.query.phone, $options: 'i' };
    if (req.query.address) filter.address = { $regex: req.query.address, $options: 'i' };
    
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Contact.countDocuments(filter);
    
    res.json({
      contacts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single contact
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update contact
exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    
    // Check if locked by another user
    if (contact.lockedBy && contact.lockedBy !== req.body.userId) {
      return res.status(403).json({ 
        message: 'Contact is locked by another user',
        lockedBy: contact.lockedBy,
        lockedAt: contact.lockedAt
      });
    }
    
    // Update contact
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lockedBy: null, lockedAt: null },
      { new: true, runValidators: true }
    );
    
    res.json(updatedContact);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete contact
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    
    // Check if locked by another user
    if (contact.lockedBy && contact.lockedBy !== req.body.userId) {
      return res.status(403).json({ 
        message: 'Contact is locked by another user',
        lockedBy: contact.lockedBy,
        lockedAt: contact.lockedAt
      });
    }
    
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lock contact for editing
exports.lockContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    
    // Check if already locked by another user
    if (contact.lockedBy && contact.lockedBy !== req.body.userId) {
      return res.status(403).json({ 
        message: 'Contact is already locked by another user',
        lockedBy: contact.lockedBy,
        lockedAt: contact.lockedAt
      });
    }
    
    // Lock the contact
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { 
        lockedBy: req.body.userId, 
        lockedAt: new Date() 
      },
      { new: true }
    );
    
    res.json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unlock contact
exports.unlockContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    
    // Check if locked by the same user
    if (contact.lockedBy !== req.body.userId) {
      return res.status(403).json({ 
        message: 'You cannot unlock a contact locked by another user',
        lockedBy: contact.lockedBy
      });
    }
    
    // Unlock the contact
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { lockedBy: null, lockedAt: null },
      { new: true }
    );
    
    res.json(updatedContact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

// Create a new contact
router.post('/', contactController.createContact);

// Get all contacts (with pagination)
router.get('/', contactController.getContacts);

// Get a single contact
router.get('/:id', contactController.getContact);

// Update a contact
router.put('/:id', contactController.updateContact);

// Delete a contact
router.delete('/:id', contactController.deleteContact);

// Lock a contact for editing
router.post('/:id/lock', contactController.lockContact);

// Unlock a contact
router.post('/:id/unlock', contactController.unlockContact);

module.exports = router;
const Contact = require('../models/contact.model');

module.exports = function(io) {
  // Track active users
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User login
    socket.on('userLogin', (userId) => {
      console.log(`User ${userId} connected`);
      activeUsers.set(socket.id, userId);
      socket.join(userId);
    });

    // Contact edit lock
    socket.on('lockContact', async ({ contactId, userId }) => {
      try {
        const contact = await Contact.findById(contactId);
        
        if (!contact) {
          socket.emit('lockError', { 
            message: 'Contact not found' 
          });
          return;
        }
        
        if (contact.lockedBy && contact.lockedBy !== userId) {
          socket.emit('lockError', { 
            message: 'Contact is already locked by another user',
            lockedBy: contact.lockedBy,
            lockedAt: contact.lockedAt
          });
          return;
        }
        
        // Lock the contact
        await Contact.findByIdAndUpdate(contactId, {
          lockedBy: userId,
          lockedAt: new Date()
        });
        
        // Broadcast lock to all other users
        socket.broadcast.emit('contactLocked', {
          contactId,
          lockedBy: userId,
          lockedAt: new Date()
        });
        
        socket.emit('lockSuccess', {
          contactId,
          lockedBy: userId,
          lockedAt: new Date()
        });
      } catch (error) {
        socket.emit('lockError', { message: error.message });
      }
    });

    // Contact edit unlock
    socket.on('unlockContact', async ({ contactId, userId }) => {
      try {
        const contact = await Contact.findById(contactId);
        
        if (!contact) {
          socket.emit('unlockError', { message: 'Contact not found' });
          return;
        }
        
        if (contact.lockedBy !== userId) {
          socket.emit('unlockError', { 
            message: 'You cannot unlock a contact locked by another user' 
          });
          return;
        }
        
        // Unlock the contact
        await Contact.findByIdAndUpdate(contactId, {
          lockedBy: null,
          lockedAt: null
        });
        
        // Broadcast unlock to all users
        io.emit('contactUnlocked', { contactId });
        
        socket.emit('unlockSuccess', { contactId });
      } catch (error) {
        socket.emit('unlockError', { message: error.message });
      }
    });

    // Contact updated
    socket.on('contactUpdated', (contact) => {
      socket.broadcast.emit('contactChanged', contact);
    });

    // Contact deleted
    socket.on('contactDeleted', (contactId) => {
      socket.broadcast.emit('contactRemoved', contactId);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      const userId = activeUsers.get(socket.id);
      if (userId) {
        console.log(`User ${userId} disconnected`);
        
        // Unlock any contacts locked by this user
        try {
          const lockedContacts = await Contact.find({ lockedBy: userId });
          
          for (const contact of lockedContacts) {
            await Contact.findByIdAndUpdate(contact._id, {
              lockedBy: null,
              lockedAt: null
            });
            
            io.emit('contactUnlocked', { contactId: contact._id });
          }
        } catch (error) {
          console.error('Error unlocking contacts on disconnect:', error);
        }
        
        activeUsers.delete(socket.id);
      }
    });
  });
};
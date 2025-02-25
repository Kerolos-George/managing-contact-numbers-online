// src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.eventListeners = new Map();
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000', {
        transports: ['websocket'],
        withCredentials: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to socket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      // Register event listeners from the map
      this.eventListeners.forEach((listeners, event) => {
        listeners.forEach(listener => {
          this.socket.on(event, listener);
        });
      });
    }
  }

  login(userId) {
    if (this.socket && userId) {
      this.socket.emit('userLogin', userId);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Lock a contact
  lockContact(contactId, userId) {
    if (this.socket) {
      this.socket.emit('lockContact', { contactId, userId });
    }
  }

  // Unlock a contact
  unlockContact(contactId, userId) {
    if (this.socket) {
      this.socket.emit('unlockContact', { contactId, userId });
    }
  }

  // Notify about contact update
  contactUpdated(contact) {
    if (this.socket) {
      this.socket.emit('contactUpdated', contact);
    }
  }

  // Notify about contact deletion
  contactDeleted(contactId) {
    if (this.socket) {
      this.socket.emit('contactDeleted', contactId);
    }
  }

  // Add event listener
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);

    // If socket already exists, register the listener
    if (this.socket) {
      this.socket.on(event, listener);
    }
  }

  // Remove event listener
  off(event, listener) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      if (this.socket) {
        this.socket.off(event, listener);
      }
    }
  }
}

const socketService = new SocketService();
export default socketService;
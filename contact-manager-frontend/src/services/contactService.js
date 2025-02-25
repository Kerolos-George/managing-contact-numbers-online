// src/services/contactService.js
import api from './api';

const contactService = {
  // Get all contacts with pagination and filters
  getContacts: async (page = 1, limit = 5, filters = {}) => {
    const params = new URLSearchParams({ page, limit });
    
    // Add filters to query params
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/contacts?${params.toString()}`);
    return response.data;
  },

  // Get a specific contact
  getContact: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  // Create a new contact
  createContact: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },

  // Update a contact
  updateContact: async (id, contactData) => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },

  // Delete a contact
  deleteContact: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },

  // Lock a contact for editing
  lockContact: async (id, userId) => {
    const response = await api.post(`/contacts/${id}/lock`, { userId });
    return response.data;
  },

  // Unlock a contact
  unlockContact: async (id, userId) => {
    const response = await api.post(`/contacts/${id}/unlock`, { userId });
    return response.data;
  }
};

export default contactService;
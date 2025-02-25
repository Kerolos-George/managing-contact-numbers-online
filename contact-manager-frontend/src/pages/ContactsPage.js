// src/pages/ContactsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import contactService from '../services/contactService';
import socketService from '../services/socketService';
import ContactForm from '../components/ContactForm';
import ContactList from '../components/ContactList';
import ContactFilter from '../components/ContactFilter';
import Pagination from '../components/Pagination';
import './ContactsPage.css';

const ContactsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [contacts, setContacts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [filters, setFilters] = useState({});
  const [lockedContacts, setLockedContacts] = useState({});
  const [error, setError] = useState('');

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contactService.getContacts(currentPage, 5, filters);
      setContacts(data.contacts);
      setTotalPages(data.totalPages);
      setTotalContacts(data.total);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  // Initial data fetch and socket setup
  useEffect(() => {
    fetchContacts();
    
    // Set up socket listeners
    socketService.on('contactLocked', (data) => {
      setLockedContacts(prev => ({
        ...prev,
        [data.contactId]: data.lockedBy
      }));
    });
    
    socketService.on('contactUnlocked', (data) => {
      setLockedContacts(prev => {
        const updated = { ...prev };
        delete updated[data.contactId];
        return updated;
      });
    });
    
    socketService.on('contactChanged', (updatedContact) => {
      setContacts(prev => 
        prev.map(contact => 
          contact._id === updatedContact._id ? updatedContact : contact
        )
      );
    });
    
    socketService.on('contactRemoved', (contactId) => {
      setContacts(prev => prev.filter(contact => contact._id !== contactId));
      fetchContacts(); // Refresh to maintain correct pagination
    });
    
    socketService.on('lockError', (error) => {
      alert(`Lock error: ${error.message}`);
    });
    
    // Cleanup socket listeners on unmount
    return () => {
      socketService.off('contactLocked');
      socketService.off('contactUnlocked');
      socketService.off('contactChanged');
      socketService.off('contactRemoved');
      socketService.off('lockError');
    };
  }, [fetchContacts]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle add new contact
  const handleAddContact = async (contactData) => {
    try {
      setError('');
      await contactService.createContact(contactData);
      setShowAddForm(false);
      fetchContacts();
    } catch (err) {
      console.error('Error adding contact:', err);
      setError('Failed to add contact. Please try again.');
    }
  };

  // src/pages/ContactsPage.js (continued)

  // Handle edit contact
  const handleEditContact = async (contactId, updatedData) => {
    try {
      setError('');
      const updatedContact = await contactService.updateContact(contactId, updatedData);
      
      // Update local state
      setContacts(prev => 
        prev.map(contact => 
          contact._id === contactId ? updatedContact : contact
        )
      );
      
      // Notify other users about the update
      socketService.contactUpdated(updatedContact);
      
    } catch (err) {
      console.error('Error updating contact:', err);
      setError('Failed to update contact. Please try again.');
    }
  };

  // Handle delete contact
  const handleDeleteContact = async (contactId) => {
    try {
      setError('');
      await contactService.deleteContact(contactId);
      
      // Update local state
      setContacts(prev => prev.filter(contact => contact._id !== contactId));
      
      // Notify other users about the deletion
      socketService.contactDeleted(contactId);
      
      // Refresh to maintain correct pagination if needed
      if (contacts.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else if (contacts.length === 1) {
        fetchContacts();
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
      setError('Failed to delete contact. Please try again.');
    }
  };

  // Handle lock contact
  const handleLockContact = async (contactId) => {
    try {
      await contactService.lockContact(contactId, user.userId);
      setLockedContacts(prev => ({
        ...prev,
        [contactId]: user.userId
      }));
    } catch (err) {
      console.error('Error locking contact:', err);
      alert(`Could not lock contact: ${err.response?.data?.message || 'Unknown error'}`);
    }
  };

  // Handle unlock contact
  const handleUnlockContact = async (contactId) => {
    try {
      await contactService.unlockContact(contactId, user.userId);
      setLockedContacts(prev => {
        const updated = { ...prev };
        delete updated[contactId];
        return updated;
      });
    } catch (err) {
      console.error('Error unlocking contact:', err);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="contacts-page">
      <header className="header">
        <h1>Contact Management System</h1>
        <div className="user-info">
          <span>Welcome, {user.username}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="contacts-container">
        <div className="sidebar">
          <button 
            onClick={() => {
              setShowAddForm(true);
              setSelectedContact(null);
            }}
            className="add-contact-button"
          >
            Add New Contact
          </button>
          
          <ContactFilter onFilter={handleFilterChange} />
          
          {showAddForm && (
            <div className="form-overlay">
              <div className="form-container">
                <ContactForm 
                  contact={selectedContact}
                  onSubmit={handleAddContact}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="main-content">
          {error && <div className="error-banner">{error}</div>}
          
          <div className="contacts-header">
            <h2>Contacts ({totalContacts})</h2>
          </div>
          
          <ContactList 
            contacts={contacts}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            lockedContacts={lockedContacts}
            onLockContact={handleLockContact}
            onUnlockContact={handleUnlockContact}
            loading={loading}
          />
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
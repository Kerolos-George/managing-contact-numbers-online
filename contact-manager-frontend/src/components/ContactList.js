// src/components/ContactList.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ContactList.css';

const ContactList = ({ 
  contacts, 
  onEdit, 
  onDelete, 
  lockedContacts,
  onLockContact,
  onUnlockContact,
  loading
}) => {
  const { user } = useAuth();
  const [editableContactId, setEditableContactId] = useState(null);
  const [editData, setEditData] = useState({});
  const [editField, setEditField] = useState(null);

  const handleCellClick = (contact, field) => {
    if (lockedContacts[contact._id] && lockedContacts[contact._id] !== user.userId) {
      return;
    }
    if (editableContactId === contact._id) {
      setEditField(field);
      return;
    }
    onLockContact(contact._id);
    setEditableContactId(contact._id);
    setEditField(field);
    setEditData({ ...contact });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      setEditableContactId(null);
      setEditField(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = (contactId) => {
    onEdit(contactId, editData);
    setEditableContactId(null);
    setEditField(null);
    onUnlockContact(contactId);
  };

  const handleCancelClick = (contactId) => {
    setEditableContactId(null);
    setEditField(null);
    onUnlockContact(contactId);
  };

  const handleDeleteClick = (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      onDelete(contactId);
    }
  };

  const renderEditableCell = (contact, field) => {
    const isEditing = editableContactId === contact._id && editField === field;
    const isContactLocked = lockedContacts[contact._id] && lockedContacts[contact._id] !== user.userId;
    
    if (isEditing) {
      return (
        <div className="editable-cell">
          <input
            type={field === 'notes' ? 'textarea' : 'text'}
            name={field}
            value={editData[field] || ''}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className="editable-input"
            autoFocus
          />
        </div>
      );
    }
    
    return (
      <div 
        className={`cell-content ${isContactLocked ? 'locked' : 'clickable'}`}
        onClick={() => !isContactLocked && handleCellClick(contact, field)}
        title={isContactLocked ? `Locked by ${lockedContacts[contact._id]}` : 'Click to edit'}
        style={{ cursor: isContactLocked ? 'not-allowed' : 'pointer' }}
      >
        {contact[field]}
        {isContactLocked && <span className="lock-indicator">🔒</span>}
      </div>
    );
  };

  if (loading) return <div className="loading-indicator">Loading contacts...</div>;
  if (contacts.length === 0) return <div className="no-contacts">No contacts found</div>;

  return (
    <div className="contact-list">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => {
            const isContactLocked = lockedContacts[contact._id] && lockedContacts[contact._id] !== user.userId;
            const isEditingThisContact = editableContactId === contact._id;
            
            return (
              <tr key={contact._id} className={isContactLocked ? 'locked-row' : (isEditingThisContact ? 'editing-row' : '')}>
                <td>{renderEditableCell(contact, 'name')}</td>
                <td>{renderEditableCell(contact, 'phone')}</td>
                <td>{renderEditableCell(contact, 'address')}</td>
                <td>{renderEditableCell(contact, 'notes')}</td>
                <td className="actions">
                  {isEditingThisContact ? (
                    <>
                      <button onClick={() => handleSaveClick(contact._id)} className="save-btn">Save</button>
                      <button onClick={() => handleCancelClick(contact._id)} className="cancel-btn">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => handleDeleteClick(contact._id)} disabled={isContactLocked} className="delete-btn">Delete</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ContactList;

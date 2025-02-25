// src/components/ContactFilter.js
import React, { useState } from 'react';
import './ContactFilter.css';

const ContactFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({
      name: '',
      phone: '',
      address: ''
    });
    onFilter({});
  };

  return (
    <div className="filter-container">
      <h3>Filter Contacts</h3>
      <form onSubmit={handleSubmit} className="filter-form">
        <div className="filter-group">
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleInputChange}
            placeholder="Filter by Name"
          />
        </div>
        
        <div className="filter-group">
          <input
            type="text"
            name="phone"
            value={filters.phone}
            onChange={handleInputChange}
            placeholder="Filter by Phone"
          />
        </div>
        
        <div className="filter-group">
          <input
            type="text"
            name="address"
            value={filters.address}
            onChange={handleInputChange}
            placeholder="Filter by Address"
          />
        </div>
        
        <div className="filter-buttons">
          <button type="submit" className="apply-filter">Apply Filters</button>
          <button type="button" onClick={handleReset} className="reset-filter">Reset</button>
        </div>
      </form>
    </div>
  );
};

export default ContactFilter;
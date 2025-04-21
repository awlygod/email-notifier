// src/components/AddPaper.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const AddPaper = () => {
  const [paper, setPaper] = useState({
    paperId: '',
    title: '',
    domain: 'Cyber', // Default domain
    slots: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  const handleChange = (e) => {
    setPaper({
      ...paper,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create empty slots S1-S5
    const slots = ['S1', 'S2', 'S3', 'S4', 'S5'].map(slotNumber => ({
      slotNumber,
      isFilled: false
    }));
    
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/papers', {
        ...paper,
        slots
      });
      setLoading(false);
      history.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add paper');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add New Research Paper</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="paperId" className="form-label">Paper ID</label>
          <input
            type="text"
            className="form-control"
            id="paperId"
            name="paperId"
            value={paper.paperId}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={paper.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-3">
          <label htmlFor="domain" className="form-label">Domain</label>
          <select
            className="form-control"
            id="domain"
            name="domain"
            value={paper.domain}
            onChange={handleChange}
            required
          >
            <option value="Cyber">Cyber</option>
            <option value="AI">AI</option>
            <option value="Data Science">Data Science</option>
            <option value="IoT">IoT</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Paper'}
        </button>
      </form>
    </div>
  );
};

export default AddPaper;
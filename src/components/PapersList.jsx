// src/components/PapersList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PapersList = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSlot, setSelectedSlot] = useState({});

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/papers');
      setPapers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch papers');
      setLoading(false);
    }
  };

  const fillSlot = async (paperId, slotNumber) => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      await axios.put(`http://localhost:5000/api/papers/${paperId}/fill-slot`, {
        slotNumber,
        email
      });
      setEmail('');
      setSelectedSlot({});
      fetchPapers(); // Refresh papers list
    } catch (err) {
      setError('Failed to fill slot');
    }
  };

  if (loading) return <div>Loading papers...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h2>Research Papers</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Paper ID</th>
            <th>Title</th>
            <th>Domain</th>
            <th>Status</th>
            <th>Available Slots</th>
          </tr>
        </thead>
        <tbody>
          {papers.map(paper => (
            <tr key={paper._id}>
              <td>{paper.paperId}</td>
              <td>{paper.title}</td>
              <td>{paper.domain}</td>
              <td>
                <span className={`badge bg-${
                  paper.status === 'pending' ? 'warning' :
                  paper.status === 'submit' ? 'info' :
                  paper.status === 'reviewing' ? 'primary' :
                  paper.status === 'accepted' ? 'success' : 'secondary'
                }`}>
                  {paper.status}
                </span>
              </td>
              <td>
                <div className="d-flex flex-wrap">
                  {['S1', 'S2', 'S3', 'S4', 'S5'].map(slotNumber => {
                    const slot = paper.slots.find(s => s.slotNumber === slotNumber);
                    const isFilled = slot && slot.isFilled;
                    
                    return (
                      <div key={slotNumber} className="me-2 mb-2">
                        <button 
                          className={`btn btn-sm ${isFilled ? 'btn-secondary disabled' : 'btn-outline-primary'}`}
                          onClick={() => setSelectedSlot({ paperId: paper._id, slotNumber })}
                          disabled={isFilled}
                        >
                          {slotNumber}
                          {isFilled ? ' (Filled)' : ''}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedSlot.paperId === paper._id && (
                  <div className="mt-2">
                    <div className="input-group">
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => fillSlot(paper._id, selectedSlot.slotNumber)}
                      >
                        Fill {selectedSlot.slotNumber}
                      </button>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PapersList;
// src/components/PaperTracking.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaperTracking = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchPapersWithFilledSlots();
  }, []);

  const fetchPapersWithFilledSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/papers/filled-slots');
      setPapers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch papers');
      setLoading(false);
    }
  };

  const updateStage = async (paperId, stage) => {
    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:5000/api/papers/${paperId}/update-stage`, { stage });
      
      // Update the paper in the state
      setPapers(papers.map(p => p._id === paperId ? {...p, status: stage} : p));
      
      setNotification({
        message: response.data.message,
        type: 'success'
      });
      
      setLoading(false);
      
      // Hide notification after 5 seconds
      setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stage');
      setLoading(false);
    }
  };

  const getNextStage = (currentStage) => {
    const stages = ['pending', 'submit', 'reviewing', 'accepted', 'published'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  };

  if (loading && papers.length === 0) return <div>Loading papers...</div>;
  
  return (
    <div>
      <h2>Paper Tracking (Admin)</h2>
      <p>Papers with all slots filled</p>
      
      {notification.message && (
        <div className={`alert alert-${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {papers.length === 0 ? (
        <div className="alert alert-info">No papers with all slots filled</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Paper ID</th>
              <th>Title</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Action</th>
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
                  {getNextStage(paper.status) ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => updateStage(paper._id, getNextStage(paper.status))}
                      disabled={loading}
                    >
                      Move to {getNextStage(paper.status)}
                    </button>
                  ) : (
                    <span className="text-muted">Final stage reached</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaperTracking;
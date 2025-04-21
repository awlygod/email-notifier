// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import PapersList from './components/PapersList';
import PaperTracking from './components/PaperTracking';
import AddPaper from './components/AddPaper';

function App() {
  return (
    <Router>
      <div className="container">
        <nav className="navbar navbar-expand navbar-dark bg-dark mb-4">
          <div className="container">
            <Link to="/" className="navbar-brand">Paper Management System</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to="/" className="nav-link">Papers</Link>
                </li>
                <li className="nav-item">
                  <Link to="/tracking" className="nav-link">Tracking</Link>
                </li>
                <li className="nav-item">
                  <Link to="/add" className="nav-link">Add Paper</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <Switch>
          <Route exact path="/" component={PapersList} />
          <Route path="/tracking" component={PaperTracking} />
          <Route path="/add" component={AddPaper} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
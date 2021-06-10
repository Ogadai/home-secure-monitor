import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Streams from './Streams/Streams';
import Recordings from './Recordings/Recordings';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Live Video</Link>
            </li>
            <li>
              <Link to="/recordings">Recordings</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/recordings">
            <Recordings />
          </Route>
          <Route path="/">
            <Streams />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;

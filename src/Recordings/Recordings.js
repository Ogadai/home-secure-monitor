import React, { useEffect, useState } from 'react';
import styles from './Recordings.module.css';

const address = document.location.href.startsWith('http://localhost')
  ? `${process.env.REACT_APP_HOME_SECURE_SERVER}/cameras`
  : '/cameras';

function Recordings() {
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    const getFeeds = async () => {
      const response = await fetch(address);
      const cameraData = await response.json();
      setRecordings(cameraData.recordings);
    }
    getFeeds();
  }, []);

  return (
    <div className={ styles.Recordings }>
      <a href={recordings}>Recordings</a>
    </div>
  );
}
export default Recordings;

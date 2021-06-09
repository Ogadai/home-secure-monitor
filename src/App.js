import React, { useEffect, useState } from 'react';
import './App.css';
import LiveVideo from './LiveVideo/LiveVideo';
import JsmpVideo from './JsmpVideo/JsmpVideo';

console.log(process.env)
const address = document.location.href.startsWith('http://localhost')
  ? `${process.env.REACT_APP_HOME_SECURE_SERVER}/cameras`
  : '/cameras';

function App() {
  const [feeds, setFeeds] = useState([]);
  const [recordings, setRecordings] = useState('');
  const [selected, setSelected] = useState('');
  const [size, setSize] = useState(null);

  useEffect(() => {
    const getFeeds = async () => {
      const response = await fetch(address);
      const cameraData = await response.json();
      setFeeds(cameraData.cameras);
      setRecordings(cameraData.recordings);
    }
    getFeeds();
    const interval = setInterval(getFeeds, 10000);

    return () => {
      clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const getSize = () => {
      setSize({
        width: window.innerWidth - 10,
        height: window.innerHeight - 10
      })
    }
    if (!size) getSize();

    window.addEventListener('resize', getSize);
    return () => {
      window.removeEventListener('resize', getSize);
    }
  });

  let cameraRows = [];
  if (size && size.width > size.height && feeds.length > 2) {
    const split = Math.ceil(feeds.length / 2);
    cameraRows = [
      feeds.slice(0, split),
      feeds.slice(split)
    ];
  } else {
    cameraRows = feeds.map(cam => [cam]);
  }

  const onClick = name => {
    if (selected === name) {
      setSelected('');
    } else {
      setSelected(name);
    }
  }

  const renderVideo = (cam, camSize) => {
    const className = (selected === cam.name) ? 'selected' : '';

    if (cam.type === 'jsmp') {
      return <JsmpVideo className={className} name={cam.name}
        url={cam.address} size={camSize}
        onClick={() => onClick(cam.name)}
      ></JsmpVideo>;
    } else {
      return <LiveVideo className={className} name={cam.name}
        url={cam.address} size={camSize}
        onClick={() => onClick(cam.name)}
      ></LiveVideo>;
    }
  }

  const renderCam = (cam, rowSize) => {
    const isSelected = selected === cam.name;

    return <div style={getSize(rowSize, false)} key={cam.name}>
      { renderVideo(cam, getSize(rowSize, isSelected)) }
    </div>;
  }

  const getSize = (rowSize, isSelected) => {
    if (isSelected) {
      return size;
    } else {
      return {
        height: (size.height / cameraRows.length),
        width: (size.width / rowSize)
      }
    }
  }

  return (
    <div className="App">
      { size && <div className="App-content">
        {cameraRows.map((row, index) => 
          <div className="App-row" key={index}>
            {row.map(cam => renderCam(cam, row.length))}
          </div>
        )}
        <div className="App-recordings">
          <a href={recordings} target="recordings">Recordings</a>
        </div>
      </div> }
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import LiveVideo from '../LiveVideo/LiveVideo';
import JsmpVideo from '../JsmpVideo/JsmpVideo';
import styles from './Streams.module.css';

// Set the name of the hidden property and the change event for visibility
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

const address = document.location.href.startsWith('http://localhost')
  ? `${process.env.REACT_APP_HOME_SECURE_SERVER}/cameras`
  : '/cameras';

function Streams() {
  const [feeds, setFeeds] = useState([]);
  const [selected, setSelected] = useState('');
  const [size, setSize] = useState(null);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const getFeeds = async () => {
      const response = await fetch(address);
      const cameraData = await response.json();
      setFeeds(cameraData.cameras);
    }
    getFeeds();
    const interval = setInterval(getFeeds, 10000);

    return () => {
      clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setPageVisible(!document[hidden]);
    }
    document.addEventListener(visibilityChange, handleVisibilityChange, false);
    
    return () => {
      document.removeEventListener(visibilityChange, handleVisibilityChange);
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
    if (cam.type === 'jsmp') {
      return <JsmpVideo selected={selected === cam.name} name={cam.name}
        url={cam.address} size={camSize}
        onClick={() => onClick(cam.name)}
      ></JsmpVideo>;
    } else {
      return <LiveVideo selected={selected === cam.name} name={cam.name}
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
    <div className={styles.Streams}>
      { size && pageVisible && <div className="Streams-content">
        {cameraRows.map((row, index) => 
          <div className={styles.StreamsRow} key={index}>
            {row.map(cam => renderCam(cam, row.length))}
          </div>
        )}
      </div> }
    </div>
  );
}

export default Streams;

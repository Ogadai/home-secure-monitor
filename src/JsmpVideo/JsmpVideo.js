/*global JSMpeg*/
import React, { useRef, useEffect, useState } from 'react'
import styles from './JsmpVideo.module.css';

const JsmpVideo = ({ name, url, onClick, size, selected }) => {
  const [videoSize, setVideoSize] = useState({ width: 300, height: 200 });
  const [player, setPlayer] = useState(null);
  const [canvasStyle, setCanvasStyle] = useState({});

  const videoCanvas = useRef();
  const videoContainer = useRef();

  useEffect(() => {
    let createdPlayer = null;
    if (!player) {
      createdPlayer = new JSMpeg.Player(url, { canvas: videoCanvas.current });
      setPlayer(createdPlayer);

      const checkForSize = () => {
        if (videoCanvas && videoCanvas.current && videoCanvas.current.attributes.width) {
          setVideoSize({
            width: parseInt(videoCanvas.current.getAttribute('width')),
            height: parseInt(videoCanvas.current.getAttribute('height'))
          })
        } else {
          setTimeout(checkForSize, 100)
        }
      }
      setTimeout(checkForSize, 100)
    }

    return () => {
        console.log('cleanup JsmpVideo component');
        if (createdPlayer) createdPlayer.destroy();
    };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (videoSize) {
      const containerRatio = size.width / size.height;
      const videoRatio = videoSize.width / videoSize.height;

      const scale = (containerRatio > videoRatio) ? size.height / videoSize.height : size.width / videoSize.width;
      setCanvasStyle({
        transform: `scale(${scale})`,
        top: `calc(50% - ${videoSize.height / 2}px)`,
        left: `calc(50% - ${videoSize.width / 2}px)`
      });
    }
  }, [videoSize, size]);
  
  return (
    <div className={styles.jsmpVideo + (selected ? ' ' + styles.jsmpVideoSelected : '')}
            style={size} ref={videoContainer}>
        <canvas className={styles.jsmpCanvas} ref={videoCanvas} style={canvasStyle} onClick={onClick} />
    </div>
  );
}
export default JsmpVideo;

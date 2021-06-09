/*global JSMpeg*/
import React, { useRef, useEffect, useState } from 'react'
import styles from './JsmpVideo.module.css';

const JsmpVideo = ({ name, url, className, onClick, size }) => {
  const [videoSize, setVideoSize] = useState({ width: 300, height: 200 });
  const [player, setPlayer] = useState(null);
  const [canvasStyle, setCanvasStyle] = useState({});

  const videoCanvas = useRef();
  const videoContainer = useRef();

  useEffect(() => {
    if (!player) {
      setPlayer(new JSMpeg.Player(url, { canvas: videoCanvas.current }));

      const checkForSize = () => {
        if (videoCanvas && videoCanvas.current.attributes.width) {
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
        if (player) player.destroy();
    };
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (videoSize) {
      const containerRatio = size.width / size.height;
      const videoRatio = videoSize.width / videoSize.height;

      const scale = (containerRatio > videoRatio) ? size.height / videoSize.height : size.width / videoSize.width;
      setCanvasStyle({
        transform: `scale(${scale})`,
        'transformOrigin': `${ (scale > 1 || containerRatio > videoRatio) ? 'center' : 'left'} top`
      });
    }
  }, [videoSize, size]);
  
  return (
    <div className={styles.jsmpVideo + (className ? ' ' + className : '')}
            style={size} onClick={onClick} ref={videoContainer}>
        <canvas ref={videoCanvas} style={canvasStyle} />
    </div>
  );
}
export default JsmpVideo;

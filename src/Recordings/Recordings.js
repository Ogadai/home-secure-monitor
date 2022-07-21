import React, { useEffect, useState, useRef } from 'react';
import groupRecordings from './group-recordings';
import styles from './Recordings.module.css';

const address = document.location.href.startsWith('http://localhost')
  ? `${process.env.REACT_APP_HOME_SECURE_SERVER}/`
  : '/';

function Recordings() {
  const [cameras, setCameras] = useState([]);
  const [camera, setCamera] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [day, setDay] = useState('');
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 });
  const [saved, setSaved] = useState([]);

  const imageCarousel = useRef();
  const positionPanel = useRef();

  const cameraDays = () => {
    return camera ? cameras.find(c => c.name === camera).days : null;
  }

  useEffect(() => {
    const getCameras = async () => {
      const response = await fetch(`${address}recordings/cameras`);
      const cameraData = await response.json();

      setCameras(cameraData.cameras);

      const cam = cameraData.cameras[0];
      setCamera(cam.name);
      setImageUrl(cam.url);
    }
    getCameras();
  }, []);

  useEffect(() => {
    const getFiles = async (camera, day) => {
      const response = await fetch(`${address}recordings/clips/${camera}/${day}`);
      const fileData = await response.json();
      setFiles(groupRecordings(fileData.files.filter(f => f !== 'Thumbs.db')));
    };

    const camDays = camera ? cameras.find(c => c.name === camera).days : null;
    if (cameras && camera && (!day || !camDays.includes(day) )) {
      setDay(camDays[camDays.length - 1]);
    }
    if (camera && day) {
      getFiles(camera, day);
    }

    const resetFiles = () => {
      setFiles([]);
      getFiles(camera, day);
    }
    window.addEventListener('resize', resetFiles);
    return () => {
      window.removeEventListener('resize', resetFiles);
    }
  }, [cameras, camera, day]);

  const times = Array.from(Array(25).keys()).map(i => ({
    label: i,
    position: i / 24
  }));

  const positionTouchMove = (evt) => {
    evt.preventDefault();
    var touches = evt.changedTouches;
    if (touches.length > 0) {
      moveTo(touches[0].clientX);
    }
  }

  const mouseMove = (evt) => {
    evt.preventDefault();

    if (evt.buttons > 0) {
      moveTo(evt.clientX);
    }
  }

  const moveTo = xPos => {
    const position = xPos / positionPanel.current.clientWidth;
    let entryIndex = 0;
    while (entryIndex < files.length && position > files[entryIndex].position) {
      entryIndex++;
    }

    if (entryIndex < files.length) {
      const imageElement = imageCarousel.current.childNodes[entryIndex];
      imageCarousel.current.scrollLeft = imageElement.offsetLeft
          - (imageCarousel.current.clientWidth - imageElement.clientWidth) / 2;
    } else {
      imageCarousel.current.scrollLeft = imageCarousel.current.scrollWidth - imageCarousel.current.clientWidth;
    }
  }

  const clickCamera = cam => {
    setFiles([]);
    setCamera(cam);

    const camera = cameras.find(c => c.name === cam);
    setImageUrl(camera ? camera.url : null);
  }

  const clickDay = d => {
    setFiles([]);
    setDay(d);
  }

  const imageLoaded = (evt, i) => {
    if (i === 0) {
      const { width, height } = evt.target;
      setImageSize({ width, height });
    }
  };

  const clickVideo = (evt, index) => {
    evt.preventDefault();
    setSelected({
      file: selected.file,
      index,
      preventNext: true
    })
  }

  const videoFinished = () => {
    if (!selected.preventNext && selected.index < selected.file.videos.length - 1) {
      setSelected({
        file: selected.file,
        index: selected.index + 1
      })
    }
  }

  const saveSelected = async () => {
    const file = `${camera}/${day}/${selected.file.videos[selected.index]}`;
    if (!saved.includes(file)) {
      setSaved(saved.concat([file]));

      const response = await fetch(`${address}recordings/store/${file}`, { method: 'POST' });
      if (!response.ok) {
        let message = response.statusText;
        try {
          message = (await response.json()).error;
        } catch(e) {
        }
        alert(message);
      }
    }
  }

  const isSaved = () => {
    const file = `${camera}/${day}/${selected.file.videos[selected.index]}`;
    return saved.includes(file);
  }

  const renderFile = (file, i) => {
    const camUrl = imageUrl || `${address}recordings/files/${camera}`;
    return (<li className={styles.Recordings_item} key={file.image}
        onClick={() => setSelected({file, index: 0})}
    >
      <img src={`${camUrl}/${day}/${file.image}`} alt={file.image}
          onLoad={e => imageLoaded(e, i)}
          width={i > 0 ? imageSize.width : ''}
          height={i > 0 ? imageSize.height : ''}
        />
      <span className={styles.Recordings_label}>{file.image.substring(0, file.image.indexOf('.')).replaceAll('-', ':')}</span>
    </li>);
  }

  const renderVideo = () => {
    const camUrl = imageUrl || `${address}recordings/files/${camera}`;
    return <video controls autoPlay onEnded={() => videoFinished()}
      src={`${camUrl}/${day}/${selected.file.videos[selected.index]}`}
    ></video>
  }

  return (
    <div className={ styles.Recordings }>
      <div className={ styles.Recordings_controls }>
        { cameras &&
          <select name="camera" value={camera} onChange={e => clickCamera(e.target.value)}>
            { cameras.map(cam =>
              <option value={cam.name} key={cam.name}>{cam.name}</option>)
            }
          </select>
        }

        { cameraDays() &&
          <select name="day" value={day} onChange={e => clickDay(e.target.value)}>
            { cameraDays().map(d =>
              <option value={d} key={d}>{d}</option>)
            }
          </select>
        }
      </div>

      <div className={styles.Recordings_container}>
        <ul className={styles.Recordings_list} ref={imageCarousel}>
          { files.map(renderFile) }
        </ul>

        <div className={styles.Recordings_overlay} ref={positionPanel}
          onMouseDown={mouseMove} onMouseMove={mouseMove}
          onTouchStart={positionTouchMove} onTouchMove={positionTouchMove}>
            { files.map(file =>
              <span className={styles.Recordings_position} style={{ left: `${file.position * 100}%` }} key={file.image}></span>
            )}
            { times.map(time =>
              <span className={styles.Recordings_time} style={{ left: `${time.position * 100}%` }} key={time.label}>{String(time.label).padStart(2, '0')}</span>
            )}
        </div>
      </div>

      { selected && <div className={styles.Recordings_player}>
        <div className={styles.Recordings_save + ' fa fa-floppy-o'} onClick={() => saveSelected()} disabled={isSaved()}></div>
        <div className={styles.Recordings_close + ' fa fa-times'} onClick={() => setSelected(null)}></div>

        { renderVideo() }

        <ul className={styles.Recordings_videos}>
          { selected.file.videos.map((video, index) => 
            <li className={`${styles.Recordings_video} ${(index === selected.index) ? styles.Recordings_videoselected : ''}`} key={video}>
              <a href={`${address}recordings/files/${camera}/${day}/${video}`}
                onClick={evt => clickVideo(evt, index)}
                >{video.substring(0, video.indexOf('.')).replaceAll('-', ':')}
              </a>
            </li>
          )}
        </ul>
      </div>}
    </div>
  );
}
export default Recordings;

import React, { useEffect, useState } from 'react';
import groupRecordings from './group-recordings';
import styles from './Recordings.module.css';

const address = document.location.href.startsWith('http://localhost')
  ? `${process.env.REACT_APP_HOME_SECURE_SERVER}/`
  : '/';

// /recordings/cameras
// /recordings/clips/:name/:day
// /recordings/files/:name/:day/:file

function Recordings() {
  const [cameras, setCameras] = useState([]);
  const [camera, setCamera] = useState('');
  const [day, setDay] = useState('');
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);

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
    }
    getCameras();
  }, []);

  useEffect(() => {
    const getFiles = async (camera, day) => {
      const response = await fetch(`${address}recordings/clips/${camera}/${day}`);
      const fileData = await response.json();
      setFiles(groupRecordings(fileData.files));
    };
  
    const camDays = camera ? cameras.find(c => c.name === camera).days : null;
    if (cameras && camera && (!day || !camDays.includes(day) )) {
      setDay(camDays[camDays.length - 1]);
    }
    if (camera && day) {
      getFiles(camera, day);
    }
  }, [cameras, camera, day]);

  return (
    <div className={ styles.Recordings }>
      <div className={ styles.Recordings_controls }>
        { cameras &&
          <select name="camera" value={camera} onChange={e => setCamera(e.target.value)}>
            { cameras.map(cam =>
              <option value={cam.name} key={cam.name}>{cam.name}</option>)
            }
          </select>
        }

        { cameraDays() &&
          <select name="day" value={day} onChange={e => setDay(e.target.value)}>
            { cameraDays().map(d =>
              <option value={d} key={d}>{d}</option>)
            }
          </select>
        }
      </div>

      <ul className={styles.Recordings_list}>
        { files.map(file => 
          <li className={styles.Recordings_item} key={file.image} onClick={() => setSelected(file)}>
            <img src={`${address}recordings/files/${camera}/${day}/${file.image}`} alt={file.image} />
            <span className={styles.Recordings_label}>{file.image.substring(0, file.image.indexOf('.')).replaceAll('-', ':')}</span>
          </li>
        )}
      </ul>

      { selected && <div className={styles.Recordings_player}>
        <div className={styles.Recordings_close} onClick={() => setSelected(null)}>X</div>
        <ul className={styles.Recordings_videos}>
          { selected.videos.map(video => 
            <li className={styles.Recordings_video} key={video}>
              <a href={`${address}recordings/files/${camera}/${day}/${video}`} target="_blank">{video}</a>
            </li>
          )}
        </ul>
      </div>}
    </div>
  );
}
export default Recordings;

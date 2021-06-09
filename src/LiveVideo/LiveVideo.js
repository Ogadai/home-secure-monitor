import React, { useRef, useEffect, useState } from 'react'
import videoClient from './video-client';
import styles from './LiveVideo.module.css';

const LiveVideo = ({ name, url, className, onClick, size }) => {
    const [videoState, setVideoState] = useState('off');
    const [videoSettings, setVideoSettings] = useState({});
    const [motion, setMotion] = useState(false);

    const videoCanvas = useRef();
    const videoContainer = useRef();

    useEffect(() => {
        const onMessage = content => {
            if (content.name === 'camera' && content.event === 'motion') {
                setMotion(true);
                setTimeout(() => {
                    setMotion(false);
                }, 2000);
            }
        }

        if (videoState === 'off') {
            videoClient({
                canvas: videoCanvas.current,
                url,
                onStart: setVideoSettings,
                onMessage
            });
            setVideoState('timelapse');
        }

        return () => {
            console.log('cleanup LiveVideo component');
            if (videoSettings.close) videoSettings.close();
        };
    }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

    let canvasStyle = {};
    if (size.height && videoSettings.height) {
        const containerRatio = size.width / size.height;
        const videoRatio = videoSettings.width / videoSettings.height;

        if (containerRatio > videoRatio) {
            canvasStyle = {
                width: size.height * videoRatio,
                height: size.height
            }
        } else {
            canvasStyle = {
                width: size.width,
                height: size.width / videoRatio
            }
        }
    }

    const togglePlay = e => {
        e.stopPropagation();
        const newState = videoState === 'on' ? 'timelapse' : 'on';
        setVideoState(newState);
        videoSettings.send({
            name: 'camera',
            state: newState
        });
    }

    return (
        <div className={styles.liveVideo + (motion ? ' ' + styles.motion : '') + (className ? ' ' + className : '')}
                style={size} onClick={onClick} ref={videoContainer}>
            <div className={styles.controls}>
                <span className={styles.name}>{name}</span>
                <button onClick={togglePlay} className={videoState === 'on' ? 'fa fa-pause' : 'fa fa-play'}></button>
            </div>
            <canvas className={styles.video} ref={videoCanvas} style={canvasStyle} />
        </div>
    );
};

export default LiveVideo;

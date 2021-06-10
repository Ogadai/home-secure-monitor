import React, { useRef, useEffect, useState } from 'react'
import videoClient from './video-client';
import styles from './LiveVideo.module.css';

const LiveVideo = ({ name, url, onClick, size, selected }) => {
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

        let closeFunction = null;
        if (videoState === 'off') {
            videoClient({
                canvas: videoCanvas.current,
                url,
                onStart: settings => {
                    closeFunction = () => settings.close();
                    setVideoSettings(settings);
                },
                onMessage
            });
            setVideoState('timelapse');
        }

        return () => {
            console.log('cleanup LiveVideo component');
            if (closeFunction) closeFunction();
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
        <div className={styles.liveVideo + (motion ? ' ' + styles.motion : '') + (selected ? ' ' + styles.liveVideoSelected : '')}
                style={size} ref={videoContainer}>
            <div className={styles.controls}>
                <span className={styles.name}>{name}</span>
                <button onClick={togglePlay} className={videoState === 'on' ? 'fa fa-pause' : 'fa fa-play'}></button>
            </div>
            <canvas className={styles.video} ref={videoCanvas} style={canvasStyle} onClick={onClick} />
        </div>
    );
};

export default LiveVideo;

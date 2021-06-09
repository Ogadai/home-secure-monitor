import WSAvcPlayer from 'h264-live-player';

const videoClient = ({ canvas, url, onStart, onMessage }) => {
    const webSocket = new WebSocket(url, 'echo-protocol');
    webSocket.binaryType = "arraybuffer";

    const wsavc = new WSAvcPlayer(canvas, "webgl", 1, 35);
    let initialised = false;

    const send = message => {
        webSocket.send(JSON.stringify(message));
    };
    const close = () => {
        webSocket.close();
    }

    webSocket.onopen = () => {
        console.log('socket is connected');
        webSocket.send(JSON.stringify({
            name: 'camera',
            state: 'timelapse'
        }));
    }
    webSocket.onclose = event => {
        console.log('socket is closed', event);
    }
    webSocket.onerror = event => {
        console.log('socket error', event);
    }
    
    webSocket.onmessage = (evt) => {
        if(typeof evt.data == "string") {
            const data = JSON.parse(evt.data);
            if (!initialised && data.name === 'camera' && data.event === 'settings') {
                const { width, height } = data.content;
                console.log(`initialising ${url} (${width},${height})`);
                wsavc.initCanvas(width, height);
                initialised = true;

                if (onStart) {
                    onStart({ width, height, send, close });
                } else if (onMessage) {
                    onMessage(data.content);
                }
            } else {
                if (onMessage) {
                    onMessage(data);
                }
                console.log(data);
            }
        } else {
            var frame = new Uint8Array(evt.data);
            wsavc.addFrame(frame);
        }
    };
}

export default videoClient;
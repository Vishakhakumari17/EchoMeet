import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { Badge } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    const [showModal, setModal] = useState(false);
    const [screen, setScreen] = useState(false);
    let [screenAvailable, setScreenAvailable] = useState();
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [isWaitingForAdmit, setIsWaitingForAdmit] = useState(false);
    const [joinDenied, setJoinDenied] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const videoRef = useRef([]);

    let [videos, setVideos] = useState([])

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        console.log("HELLO")
        getPermissions();

    })

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [video, audio])
    
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream;

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            // Emitting request-join-call instead of join-call
            socketRef.current.emit('request-join-call', window.location.href, username)
            socketIdRef.current = socketRef.current.id
            setIsWaitingForAdmit(true);

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })
            
            socketRef.current.on('guest-requesting-join', (request) => {
                setPendingRequests(prev => [...prev, request]);
            });

            socketRef.current.on('join-denied', () => {
                setIsWaitingForAdmit(false);
                setJoinDenied(true);
            });

            socketRef.current.on('join-accepted', () => {
                setIsWaitingForAdmit(false);
            });

            socketRef.current.on('user-joined', (id, clients) => {
                // If it's us joining, we're admitted (host gets this instantly, guest gets it after accept)
                if (id === socketIdRef.current) {
                    setIsWaitingForAdmit(false);
                }
                
                clients.forEach((socketListId) => {
                    if (connections[socketListId] !== undefined) return;

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let closeChat = () => {
        setModal(false);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    const handleAdmit = (request, admit) => {
        socketRef.current.emit("admit-guest", request.socketId, window.location.href, admit);
        setPendingRequests(prev => prev.filter(r => r.socketId !== request.socketId));
    };

    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    return (
        <div className={styles.videoMeetContainer}>
            {askForUsername === true ? (
                <div className={styles.waitingRoom}>
                    <div className={styles.waitingCard}>
                        <h2>Ready to join?</h2>
                        <p>Check your camera and microphone before entering.</p>
                        
                        <div className={styles.previewContainer}>
                            <video className={styles.previewVideo} ref={localVideoref} autoPlay muted></video>
                        </div>
                        
                        <div className={styles.waitingControls}>
                            <input 
                                type="text" 
                                placeholder="Your Display Name" 
                                value={username} 
                                onChange={e => setUsername(e.target.value)}
                                className={styles.nameInput}
                            />
                            <button 
                                className={styles.joinMeetingBtn} 
                                onClick={connect}
                                disabled={!username.trim()}
                            >
                                Join Meeting
                            </button>
                        </div>
                    </div>
                </div>
            ) : joinDenied ? (
                <div className={styles.waitingRoom}>
                    <div className={styles.waitingCard}>
                        <h2 style={{color: 'var(--danger)'}}>Access Denied</h2>
                        <p>The host declined your request to join.</p>
                        <button className={styles.joinMeetingBtn} onClick={() => window.location.href = '/'}>
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {isWaitingForAdmit && (
                        <div className={styles.waitingRoom} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999}}>
                            <div className={styles.waitingCard}>
                                <h2>Waiting for host</h2>
                                <p>The meeting host will let you in soon.</p>
                                <div className={styles.loader}></div>
                            </div>
                        </div>
                    )}
                    <div className={styles.activeCallContainer}>
                    <div className={styles.topBar}>
                        <div className={styles.logo}>EchoMeet</div>
                        <div className={styles.meetingInfo}>
                            <span className={styles.secureIcon}>🔒</span> Secure Meeting
                            <button className={styles.copyLinkBtn} onClick={handleCopyLink}>
                                {copySuccess ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>

                    {pendingRequests.length > 0 && (
                        <div className={styles.requestsPanel}>
                            <h4>Waiting Room ({pendingRequests.length})</h4>
                            {pendingRequests.map(req => (
                                <div key={req.socketId} className={styles.requestItem}>
                                    <span><strong>{req.username}</strong> wants to join</span>
                                    <div className={styles.requestActions}>
                                        <button className={styles.admitBtn} onClick={() => handleAdmit(req, true)}>Admit</button>
                                        <button className={styles.denyBtn} onClick={() => handleAdmit(req, false)}>Deny</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.mainLayout}>
                        <div className={`${styles.videoGrid} ${showModal ? styles.withSidebar : ''}`}>
                            {/* Local Video */}
                            <div className={styles.videoWrapper}>
                                <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
                                <div className={styles.videoLabel}>You</div>
                                <div className={styles.statusIcons}>
                                    {!audio && <div className={styles.statusIcon}>🔇</div>}
                                    {!video && <div className={styles.statusIcon}>🚫📹</div>}
                                </div>
                            </div>

                            {/* Remote Videos */}
                            {videos.map((vid) => (
                                <div key={vid.socketId} className={styles.videoWrapper}>
                                    <video
                                        data-socket={vid.socketId}
                                        ref={ref => {
                                            if (ref && vid.stream) {
                                                ref.srcObject = vid.stream;
                                            }
                                        }}
                                        autoPlay
                                    ></video>
                                    <div className={styles.videoLabel}>Participant</div>
                                </div>
                            ))}
                        </div>

                        {/* Right Sidebar (Chat) */}
                        {showModal && (
                            <div className={styles.sidebar}>
                                <div className={styles.sidebarHeader}>
                                    <h3>Meeting Chat</h3>
                                    <button className={styles.closeBtn} onClick={closeChat}>×</button>
                                </div>
                                <div className={styles.chatDisplay}>
                                    {messages.length !== 0 ? messages.map((item, index) => (
                                        <div key={index} className={item.sender === username ? styles.myMessage : styles.theirMessage}>
                                            <div className={styles.messageSender}>{item.sender}</div>
                                            <div className={styles.messageBubble}>{item.data}</div>
                                        </div>
                                    )) : (
                                        <div className={styles.emptyChat}>No messages yet. Start the conversation!</div>
                                    )}
                                </div>
                                <div className={styles.chatInputArea}>
                                    <input 
                                        type="text"
                                        placeholder="Type a message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    />
                                    <button onClick={sendMessage} className={styles.sendBtn}>Send</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Control Bar */}
                    <div className={styles.bottomBar}>
                        <div className={styles.controlsGroup}>
                            <button 
                                className={`${styles.controlBtn} ${!audio ? styles.danger : ''}`} 
                                onClick={handleAudio}
                                title={audio ? "Mute Microphone" : "Unmute Microphone"}
                            >
                                {audio ? <MicIcon /> : <MicOffIcon />}
                            </button>
                            <button 
                                className={`${styles.controlBtn} ${!video ? styles.danger : ''}`} 
                                onClick={handleVideo}
                                title={video ? "Turn off Camera" : "Turn on Camera"}
                            >
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </button>
                            {screenAvailable && (
                                <button 
                                    className={`${styles.controlBtn} ${screen ? styles.active : ''}`} 
                                    onClick={handleScreen}
                                    title={screen ? "Stop Screen Share" : "Share Screen"}
                                >
                                    {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                                </button>
                            )}
                        </div>

                        <div className={styles.controlsGroup}>
                            <button 
                                className={styles.leaveBtn} 
                                onClick={handleEndCall}
                                title="Leave Call"
                            >
                                <CallEndIcon />
                            </button>
                        </div>

                        <div className={styles.controlsGroup}>
                            <button 
                                className={`${styles.controlBtn} ${showModal ? styles.active : ''}`} 
                                onClick={() => setModal(!showModal)}
                                title="Chat"
                            >
                                <Badge badgeContent={newMessages} color="error">
                                    <ChatIcon />
                                </Badge>
                            </button>
                        </div>
                    </div>
                    </div>
                </>
            )}
        </div>
    );
}
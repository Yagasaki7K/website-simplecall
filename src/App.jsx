import { useState, useEffect } from 'react';
import Peer from 'peerjs';
import { toast } from 'sonner';

function VideoCallApp() {
    const [peer, setPeer] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [peerList, setPeerList] = useState([]);
    const [user, setUser] = useState('');

    useEffect(() => {
        const peerInstance = new Peer();
        setPeer(peerInstance);

        return () => {
            peerInstance.destroy();
        };
    }, []);

    function init(userId) {
        const newPeer = new Peer(userId);
        setPeer(newPeer);

        newPeer.on('open', (id) => {
            toast.success(id + ' connected');
        });

        listenToCall(newPeer);
    }

    function listenToCall(peerInstance) {
        peerInstance.on('call', (call) => {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    setMyStream(stream);
                    addLocalVideo(stream);
                    call.answer(stream);
                    call.on('stream', (remoteStream) => {
                        if (!peerList.includes(call.peer)) {
                            addRemoteVideo(remoteStream);
                            setPeerList([...peerList, call.peer]);
                        }
                    });
                })
                .catch((err) => {
                    toast.error('unable to connect because ' + err);
                });
        });
    }

    function makeCall(receiverId) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setMyStream(stream);
                addLocalVideo(stream);
                const call = peer.call(receiverId, stream);
                call.on('stream', (remoteStream) => {
                    if (!peerList.includes(call.peer)) {
                        addRemoteVideo(remoteStream);
                        setPeerList([...peerList, call.peer]);
                    }
                });
            })
            .catch((err) => {
                toast.error('unable to connect because ' + err);
            });
    }

    function addLocalVideo(stream) {
        let video = document.createElement("video");
        video.srcObject = stream;
        video.classList.add("video");
        video.muted = true;
        video.oncanplay = () => {
            video.play().catch((error) => {
                toast.error("Erro ao reproduzir vídeo:", error);
            });
        };
        document.getElementById("localVideo").appendChild(video);

        if (video) {
            toast.success('Conectado!')
        }
    }

    function addRemoteVideo(stream) {
        let video = document.createElement("video");
        video.srcObject = stream;
        video.classList.add("video");
        video.oncanplay = () => {
            video.play().catch((error) => {
                toast.error("Erro ao reproduzir vídeo:", error);
            });
        };
        document.getElementById("remoteVideo").appendChild(video);

        if (video) {
            toast.success('Conectado!')
        }
    }

    function toggleVideo(b) {
        if (b === 'true') {
            myStream.getVideoTracks()[0].enabled = true;
        } else {
            myStream.getVideoTracks()[0].enabled = false;
        }
    }

    function toggleAudio(b) {
        if (b === 'true') {
            myStream.getAudioTracks()[0].enabled = true;
        } else {
            myStream.getAudioTracks()[0].enabled = false;
        }
    }

    return (
        <>
            <div>
                <div className="overlay" />

                <h1 id="my-id"></h1>
                <div className="video">
                    <div className="head">
                        <input type="text" onChange={(e) => setUser(e.target.value)} value={user} />
                        <button onClick={() => init(user)}>Join</button>
                    </div>

                    <div className="primary-video" id="remoteVideo"></div>
                    <div className="secondary-video" id="localVideo"></div>

                    <div className="buttons">
                        <button onClick={makeCall}>Join Call</button>
                        <button onClick={toggleVideo}>Toggle Video</button>
                        <button onClick={toggleAudio}>Toggle Audio</button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VideoCallApp;

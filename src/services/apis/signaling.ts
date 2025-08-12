export const setupSignaling = (
  socket: any,
  peerConnection: RTCPeerConnection,
  setRemoteStream: (stream: MediaStream) => void
) => {
  const remoteStream = new MediaStream();

  peerConnection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
    setRemoteStream(remoteStream);
  };

  // 👂 Only the caller needs this
  socket.on("call:answer", async ({ answer }) => {
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
      console.error("❌ Error setting remote description (answer):", err);
    }
  });

  socket.on("call:ice-candidate", async ({ candidate }) => {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("❌ Error adding ICE candidate:", err);
    }
  });
};

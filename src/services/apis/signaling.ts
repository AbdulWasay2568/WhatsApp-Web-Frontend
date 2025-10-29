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

  // 👂 Caller receives answer from callee
  const handleAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      console.log("✅ Remote description (answer) set successfully");
    } catch (err) {
      console.error("❌ Error setting remote description (answer):", err);
    }
  };

  // 👂 Both sides receive ICE candidates
  const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("✅ ICE candidate added successfully");
    } catch (err) {
      console.error("❌ Error adding ICE candidate:", err);
    }
  };

  socket.on("call:answer", handleAnswer);
  socket.on("call:ice-candidate", handleIceCandidate);

  // ✅ Cleanup function to remove listeners
  return () => {
    socket.off("call:answer", handleAnswer);
    socket.off("call:ice-candidate", handleIceCandidate);
  };
};

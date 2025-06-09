import { useEffect } from 'react';
import socket from '../services/socket';

const useSocket = (userId: number) => {
  useEffect(() => {
    
    if (!userId) return;

    socket.emit('join', userId);

    socket.on('online', (id) => {
      console.log(`User ${id} is online`);
    });

    socket.on('message', (data) => {
      console.log('New message:', data);
    });

    socket.on('typing', () => {
      console.log('User is typing...');
    });

    socket.on('incomingCall', (data) => {
      console.log('Incoming call:', data);
    });

    return () => {
      socket.off('online');
      socket.off('message');
      socket.off('typing');
      socket.off('incomingCall');
    };
  }, [userId]);
};

export default useSocket;

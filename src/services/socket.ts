import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000'; 
let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: { token: 'fake-jwt' },
    });
  }
  return socket;
}
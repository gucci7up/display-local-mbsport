import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.mbracesrd.lat';

class SocketService {
  private socket: Socket | null = null;

  public connect() {
    if (this.socket) return;

    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Socket.io connected to server:', API_URL);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });

    // Mock listeners for future integration
    this.socket.on('race_status_changed', (data) => {
      console.log('WS: Race status changed:', data);
    });

    this.socket.on('odds_updated', (data) => {
      console.log('WS: Odds updated:', data);
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Future logic goes here
  public on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const socket = new SocketService();

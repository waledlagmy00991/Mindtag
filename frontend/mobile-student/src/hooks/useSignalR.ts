import { useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '../api/client';

export const useSignalR = (hubName: 'session' | 'student') => {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const startConnection = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) return;

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${BASE_URL}/hubs/${hubName}`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connection.onclose(() => setIsConnected(false));
      connection.onreconnecting(() => setIsConnected(false));
      connection.onreconnected(() => setIsConnected(true));

      try {
        await connection.start();
        setIsConnected(true);
        connectionRef.current = connection;
        console.log(`SignalR connected to ${hubName} hub`);
      } catch (err) {
        console.error(`SignalR connection error for ${hubName} hub:`, err);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [hubName]);

  return { isConnected, connection: connectionRef.current };
};

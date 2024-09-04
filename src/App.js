import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import PingChart from './PingChart';
import './App.css';

const socket = io();

const App = () => {
  const [ip, setIp] = useState('');
  const [pingData, setPingData] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    socket.on('pingData', (data) => {
      setPingData((prevData) => [...prevData, data]);
    });

    socket.on('pingSummary', (data) => {
      setSummary(data);
    });

    return () => {
      socket.off('pingData');
      socket.off('pingSummary');
    };
  }, []);

  const startPing = () => {
    setPingData([]);
    setSummary(null);
    socket.emit('startPing', ip);
  };

  const stopPing = () => {
    socket.emit('stopPing');
  };

  return (
    <div className="container">
      <h1>Boroa Ping Master</h1>
      <div>
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Ingrese una dirección IP"
        />
        <button onClick={startPing}>Iniciar Simulacion</button>
        <button onClick={stopPing}>Detener Simulacion </button>
      </div>
      <div className="chart-container">
        <PingChart pingData={pingData} />
      </div>
      {summary && (
        <div className="summary">
          <p>Latencia Mínima: {summary.minLatency} ms</p>
          <p>Latencia Promedio: {summary.avgLatency} ms</p>
          <p>Latencia Máxima: {summary.maxLatency} ms</p>
          <p>Pérdida de Paquetes: {summary.packetLossCount}</p>
        </div>
      )}
    </div>
  );
};

export default App;

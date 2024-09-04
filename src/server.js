const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ping = require('ping');
const path = require('path');
const cors = require('cors'); // Import cors

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Use cors middleware
app.use(cors());

app.use(express.static(path.join(__dirname, '..', 'build')));

io.on('connection', (socket) => {
  console.log('New client connected');

  let pingInterval;
  let latencies = [];
  let packetLossCount = 0;

  socket.on('startPing', (ip) => {
    console.log(`Starting ping to ${ip}`);
    latencies = [];
    packetLossCount = 0;

    pingInterval = setInterval(async () => {
      try {
        const res = await ping.promise.probe(ip);
        const latency = parseFloat(res.time);
        const packetLoss = res.packetLoss > 0;

        if (packetLoss) {
          packetLossCount++;
        }

        latencies.push(latency);

        socket.emit('pingData', {
          latency,
          packetLoss,
        });
      } catch (error) {
        console.error('Error during ping:', error);
      }
    }, 1000);
  });

  socket.on('stopPing', () => {
    clearInterval(pingInterval);

    if (latencies.length > 0) {
      const minLatency = Math.min(...latencies);
      const maxLatency = Math.max(...latencies);
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

      socket.emit('pingSummary', {
        minLatency,
        maxLatency,
        avgLatency,
        packetLossCount,
      });
    }

    latencies = [];
    packetLossCount = 0;
    console.log('Ping monitoring stopped');
  });

  socket.on('disconnect', () => {
    clearInterval(pingInterval);
    console.log('Client disconnected');
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});

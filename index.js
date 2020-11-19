/* eslint-disable func-names */
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const WebSocket = require('ws');
const app = express();
const cors = require('cors');
app.use(express.static(path.join(__dirname, 'build')));
//Parsear el body usando body parser
app.use(bodyParser.json()); // body en formato json
app.use(bodyParser.urlencoded({ extended: false })); //body formulario

app.use(
  cors({
    credentials: false,
    origin: ['http://localhost:3003', 'http://localhost:5000'],
  }),
);

let connectedUsers = [];
let arrayKey;
const wss = new WebSocket.Server({ port: 8082 });
wss.on('connection', (ws) => {
  console.log('New client connected!');

  ws.on('message', async (data) => {
    const newData = await JSON.parse(data);
    await connectedUsers.push(newData);
    arrayKey = connectedUsers.map((item, key) => {
      if (item.idSystemUser === newData.idSystemUser) {
        return key;
      }
    });
  });
  ws.on('close', () => {
    // const deleteIndex = parseInt(arrayKey);
    // connectedUsers.splice(deleteIndex, 1);
    console.log('Client disconnected ', connectedUsers);
  });
});

app.post('/ping', async (req, res, next) => {
  await wss.clients.forEach(async (client) => {
    if (client.readyState === WebSocket.OPEN) {
      setTimeout(() => {
        console.log('CONNECTED USERS >> ', connectedUsers);
        client.send(JSON.stringify(connectedUsers));
      }, 1500);
    }
  });
  return res.send('oong');
});

app.post('/pong', (req, res, next) => {
  const { dataProfile } = req.body;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      setTimeout(() => {
        // connectedUsers.splice(arrayKey, 1);
        const newArray = connectedUsers.filter((item) => {
          if (item.idSystemUser !== dataProfile.idSystemUser) {
            return item;
          }
        });

        connectedUsers = newArray;
        console.log(connectedUsers, '>>>>>>>>>>>>>>>>>>>>>>>>');
        client.send(JSON.stringify(connectedUsers));
      }, 1500);
    }
  });
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8001, () => {
  console.log('listening');
});

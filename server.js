const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json'); // Ajoutez votre propre clé de service Firebase ici

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://votre-projet.firebaseio.com' // Remplacez par l'URL de votre base de données Firebase
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('Utilisateur connecté');

  // Écoute des nouvelles positions
  socket.on('newPosition', (position) => {
    console.log('Nouvelle position reçue:', position);

    // Enregistrement de la position dans la base de données Firebase
    admin.database().ref('positions').push(position);

    // Diffusion de la nouvelle position à tous les utilisateurs connectés
    io.emit('updatePosition', position);
  });

  socket.on('disconnect', () => {
    console.log('Utilisateur déconnecté');
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Serveur écoutant sur le port ${port}`);
});

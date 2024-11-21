require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const webPush = require('web-push');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

const app = express();

// Configuración de MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch((error) => console.error('Error al conectar a MongoDB:', error));

/*
// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Permitir solicitudes desde tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type'], // Headers permitidos
}));

*/

const allowedOrigins = [
  'http://localhost:5173', // Desarrollo local
  'https://notificacionesfrontend.onrender.com' // Tu frontend en Render
];

app.use(cors({
  origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
  credentials: true // Permitir cookies si las usas
}));


app.use(bodyParser.json());

// Configuración de VAPID
webPush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Rutas
app.use('/api/subscriptions', subscriptionRoutes);

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

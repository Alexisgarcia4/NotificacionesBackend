const express = require('express');
const webPush = require('web-push');
const Subscription = require('../models/Subscription');

const router = express.Router();

// Guardar suscripción
router.post('/subscribe', async (req, res) => {
  const { subscription } = req.body;

  try {
    const existingSubscription = await Subscription.findOne({ endpoint: subscription.endpoint });

    if (existingSubscription) {
      existingSubscription.p256dh = subscription.keys.p256dh;
      existingSubscription.auth = subscription.keys.auth;
      await existingSubscription.save();

      return res.status(200).json({ message: 'Suscripción actualizada' });
    }

    const newSubscription = new Subscription({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    });

    await newSubscription.save();
    res.status(201).json({ message: 'Suscripción creada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al guardar la suscripción' });
  }
});

// // Enviar notificaciones
// router.post('/notify', async (req, res) => {
//   const { message } = req.body;

//   try {
//     const subscriptions = await Subscription.find();

//     subscriptions.forEach((sub) => {
//       const payload = JSON.stringify({ title: 'Notificación', body: message });

//       webPush.sendNotification(
//         {
//           endpoint: sub.endpoint,
//           keys: { p256dh: sub.p256dh, auth: sub.auth },
//         },
//         payload
//       ).catch(console.error);
//     });

//     res.status(200).json({ message: 'Notificaciones enviadas' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error al enviar las notificaciones' });
//   }
// });

// Enviar notificaciones
router.post('/notify', async (req, res) => {
  const { title, message, link } = req.body;

  if (!title || !message || !link) {
    return res.status(400).json({ message: 'Faltan datos: title, message o link' });
  }

  try {
    const subscriptions = await Subscription.find();

    subscriptions.forEach((sub) => {
      const payload = JSON.stringify({ 
        title, 
        body: message, 
        link 
      });

      webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      ).catch(console.error);
    });

    res.status(200).json({ message: 'Notificaciones enviadas' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar las notificaciones' });
  }
});

// Verificar si está registrado
router.post('/isRegistered', async (req, res) => {
  const { endpoint } = req.body;

  try {
    const existingSubscription = await Subscription.findOne({ endpoint });

    if (existingSubscription) {
      return res.status(200).json({ registered: true, message: 'Usuario registrado' });
    }

    res.status(200).json({ registered: false, message: 'Usuario no registrado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al verificar la suscripción' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const authenticate = require('../middlewares/Authenticate');
const FitnessData = require('../models/Fitnessdata');
const GoogleToken = require('../models/Googletoken');

require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.location.read',
];

// GET /api/fitness/auth-url
router.get('/auth-url', authenticate, (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state: req.userId,
  });
  res.json({ url });
});

// GET /api/fitness/callback
router.get('/callback', async (req, res) => {
  const { code, state: userId } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    await GoogleToken.findOneAndUpdate(
      { userId },
      {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        expiryDate: tokens.expiry_date,
      },
      { upsert: true, new: true }
    );
    res.redirect(`${process.env.FRONTEND_URL}/activity?fitness=connected`);
  } catch (err) {
    console.error('OAuth callback error:', err.message);
    res.redirect(`${process.env.FRONTEND_URL}/activity?fitness=error`);
  }
});

// GET /api/fitness/status
router.get('/status', authenticate, async (req, res) => {
  try {
    const token = await GoogleToken.findOne({ userId: req.userId });
    res.json({ connected: !!token });
  } catch (err) {
    res.json({ connected: false });
  }
});

// GET /api/fitness/data?date=YYYY-MM-DD
router.get('/data', authenticate, async (req, res) => {
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const dateStr = req.query.date || localDate;
  const isToday = dateStr === localDate;

  try {
    // Return cache for past dates
    const cached = await FitnessData.findOne({ userId: req.userId, date: dateStr });
    if (cached && !isToday) return res.json({ data: cached, source: 'cache' });

    const tokenDoc = await GoogleToken.findOne({ userId: req.userId });
    if (!tokenDoc) {
      return res.status(401).json({ message: 'Google Fit not connected.' });
    }

    oauth2Client.setCredentials({
      access_token: tokenDoc.accessToken,
      refresh_token: tokenDoc.refreshToken,
      expiry_date: tokenDoc.expiryDate,
    });

    oauth2Client.on('tokens', async (newTokens) => {
      if (newTokens.access_token) {
        await GoogleToken.findOneAndUpdate(
          { userId: req.userId },
          { accessToken: newTokens.access_token, expiryDate: newTokens.expiry_date }
        );
      }
    });

    // Use start of day to end of day in milliseconds
    const startMs = new Date(`${dateStr}T00:00:00`).getTime();
    const endMs   = new Date(`${dateStr}T23:59:59`).getTime();

    const fitness = google.fitness({ version: 'v1', auth: oauth2Client });

    // Helper to aggregate any data type
    const aggregate = (dataTypeName) => fitness.users.dataset.aggregate({
      userId: 'me',
      requestBody: {
        aggregateBy: [{ dataTypeName }],
        bucketByTime: { durationMillis: endMs - startMs },
        startTimeMillis: startMs,
        endTimeMillis: endMs,
      },
    });

    // Fetch all metrics — try multiple data type names for compatibility
    const [
      stepsRes,
      calActiveRes,
      calTotalRes,
      distRes,
      activeRes,
      moveRes,
    ] = await Promise.allSettled([
      aggregate('com.google.step_count.delta'),
      aggregate('com.google.calories.expended'),
      aggregate('com.google.calories.bmr'),
      aggregate('com.google.distance.delta'),
      aggregate('com.google.active_minutes'),
      aggregate('com.google.heart_minutes'),
    ]);

    // Extract integer value from response
    const extractInt = (result) => {
      if (result.status !== 'fulfilled') return 0;
      try {
        return (result.value.data.bucket?.[0]?.dataset?.[0]?.point || [])
          .reduce((s, p) => s + (p.value?.[0]?.intVal || 0), 0);
      } catch { return 0; }
    };

    // Extract float value from response
    const extractFloat = (result) => {
      if (result.status !== 'fulfilled') return 0;
      try {
        return (result.value.data.bucket?.[0]?.dataset?.[0]?.point || [])
          .reduce((s, p) => s + (p.value?.[0]?.fpVal || 0), 0);
      } catch { return 0; }
    };

    const steps          = extractInt(stepsRes);
    const calActive      = extractFloat(calActiveRes);
    const calBmr         = extractFloat(calTotalRes);
    // Use active calories if available, else fall back to BMR estimate
    const caloriesBurned = Math.round(calActive > 0 ? calActive : calBmr);
    const distance       = Math.round(extractFloat(distRes));
    const activeMinutes  = extractInt(activeRes) || extractInt(moveRes);

    console.log('Fitness data fetched:', { steps, caloriesBurned, distance, activeMinutes });

    const fitnessData = await FitnessData.findOneAndUpdate(
      { userId: req.userId, date: dateStr },
      { steps, caloriesBurned, distance, activeMinutes },
      { upsert: true, new: true }
    );

    return res.json({ data: fitnessData, source: 'google-fit' });

  } catch (err) {
    console.error('Fitness data fetch error:', err.message);
    const cached = await FitnessData.findOne({ userId: req.userId, date: dateStr });
    if (cached) return res.json({ data: cached, source: 'cache' });
    return res.status(500).json({ message: 'Failed to fetch fitness data.', error: err.message });
  }
});

// DELETE /api/fitness/disconnect
router.delete('/disconnect', authenticate, async (req, res) => {
  try {
    await GoogleToken.findOneAndDelete({ userId: req.userId });
    res.json({ message: 'Google Fit disconnected.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to disconnect.' });
  }
});

module.exports = router;

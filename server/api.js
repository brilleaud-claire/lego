const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/deals/', async (request, response) => {
  const db = require("./mangodb");
  const collectionName = "dealabs";
  try {
    // Initialiser la connexion MongoDB
    const { client, collection } = await db.initialize(collectionName);

    
    // Récupérer et trier les données
    const dealabs = await collection.find({})
      .toArray();

    // Fermer la connexion MongoDB
    await client.close();

    // Envoyer la réponse au client
    response.json(dealabs);
  } catch (err) {
    console.error("Unexpected error:", err);
    response.status(500).json({ error: "An unexpected error occurred" });
  }
});

app.get('/deals/search', async (req, res) => {
  const db = require('./mangodb');
  const collectionName = 'dealabs';

  const { limit = 12, price, date, filterBy } = req.query;
  const parsedLimit = parseInt(limit);
  const parsedPrice = parseFloat(price);
  const parsedDate = date ? new Date(date).getTime() : undefined; //AAAA-JJ-MM

  console.log('Parsed parameters:', { parsedLimit, parsedPrice, parsedDate, filterBy });

  try {
    const { client, collection } = await db.initialize(collectionName);

    // Debug : Afficher toutes les données
    //const allData = await collection.find({}).toArray();
    //console.log('All Data:', allData);

    // Construire le filtre
    const query = {};
    if (parsedPrice && parsedPrice > 0) query.price = { $lte: parsedPrice, $gt: 0 };
    if (parsedDate) query.published = { $gte: parsedDate };

    // Tri
    const sort = { price: 1 };
    if (filterBy === 'best-discount') sort.discount = -1;
    if (filterBy === 'most-commented') sort.commentCount = -1;

    console.log('MongoDB Query:', query, 'Sort:', sort);

    // Récupérer les données
    const results = await collection.find(query)
      .sort(sort)
      .limit(parsedLimit)
      .toArray();

    //console.log('Results:', results);
    await client.close();

    res.json({
      limit: parsedLimit,
      total: results.length,
      results
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});


app.get('/sales/search', async (req, res) => {
  const db = require('./mangodb');
  const collectionName = 'vinted';

  const { limit = 12, legoSetId } = req.query;

  try {
    const { client, collection } = await db.initialize(collectionName);

    // Construire le filtre
    const query = {};
    if (legoSetId) query.id = legoSetId;

    // Récupérer les données triées par date décroissante
    const results = await collection.find(query)
      .sort({ published: -1 }) // Date décroissante
      .limit(parseInt(limit))
      .toArray();

    await client.close();

    res.json({
      limit: parseInt(limit),
      total: results.length,
      results
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});



app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);

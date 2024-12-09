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

const { calculateLimitAndOffset, paginate } = require('paginate-info');

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/deals/', async (req, res) => {
  const db = require('./mangodb');
  const collectionName = 'dealabs';

  // Récupérer les paramètres de pagination
  const { page = 1, limit = 10 } = req.query;
  const parsedPage = Math.max(parseInt(page), 1); // Numéro de page, minimum = 1
  const parsedLimit = Math.max(parseInt(limit), 1); // Limite par page, minimum = 1
  
  // Calculer l'offset et la limite
  const { limit: pageLimit, offset } = calculateLimitAndOffset(parsedPage, parsedLimit);

  try {
    // Initialiser la connexion MongoDB
    const { client, collection } = await db.initialize(collectionName);
    
    // Récupérer le nombre total d'éléments
    const totalItems = await collection.countDocuments();

    // Récupérer les données paginées
    const dealabs = await collection.find({})
      .skip(offset) // Ignorer les éléments jusqu'à l'offset
      .limit(pageLimit) // Limiter le nombre d'éléments récupérés
      .toArray();

    // Calculer les métadonnées de pagination
    const paginationInfo = paginate(parsedPage, totalItems, parsedLimit);

    // Fermer la connexion MongoDB
    await client.close();

    // Retourner les résultats avec la pagination
    res.json({
      results: dealabs,
      pagination: paginationInfo,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.get('/deals/search', async (req, res) => {
  const db = require('./mangodb');
  const collectionName = 'dealabs';

  const { page = 1, limit = 10, price, date, filterBy } = req.query;
  const parsedPage = Math.max(parseInt(page), 1);
  const parsedLimit = Math.max(parseInt(limit), 1);
  const parsedPrice = parseFloat(price);
  const parsedDate = date ? new Date(date).getTime() : undefined; //AAAA-JJ-MM
  const { limit: pageLimit, offset } = calculateLimitAndOffset(parsedPage, parsedLimit);


  try {
    const { client, collection } = await db.initialize(collectionName);
    
    // Construire le filtre
    const query = {};
    if (parsedPrice && parsedPrice > 0) query.price = { $lte: parsedPrice, $gt: 0 };
    if (parsedDate) query.published = { $gte: parsedDate };

    // Tri
    const sort = { price: 1 };
    if (filterBy === 'best-discount') sort.discount = -1;
    if (filterBy === 'most-commented') sort.commentCount = -1;

    console.log('MongoDB Query:', query, 'Sort:', sort);

    const totalItems = await collection.countDocuments(query);
    const paginationInfo = paginate(parsedPage, totalItems, parsedLimit);
    const results = await collection.find(query)
      .sort(sort)
      .skip(offset)
      .limit(pageLimit)
      .toArray();

    await client.close();

    res.json({ results, pagination: paginationInfo });
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

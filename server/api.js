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

app.get('/', async (request, response) => {
  const db = require("./mangodb");
  const collectionName = "dealabs";
  try {
    // Initialiser la connexion MongoDB
    const { client, collection } = await db.initialize(collectionName);

    const order = 1; // Tri croissant (par exemple)
    
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



app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);

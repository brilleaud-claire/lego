const fs = require('fs');
//const {MongoClient} = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
const MONGODB_DB_NAME = 'lego';
const uri = "mongodb+srv://clairebrilleaud:dgHLzdoa54@clusterlego.jrtz9.mongodb.net/?retryWrites=true&w=majority&appName=ClusterLego";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function Mongo(){
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const db = client.db(MONGODB_DB_NAME);
        const collection = db.collection('dealabs');

        // Charger les données JSON
        const jsonData = fs.readFileSync('./combined_dealLabs.json', 'utf-8');
        const dealabs = JSON.parse(jsonData);
        console.log(`Loaded ${dealabs.length} deals from JSON`);

        // Insérer les données dans MongoDB
        const result = await collection.insertMany(dealabs);
        console.log(`Inserted ${result.insertedCount} documents into the collection`);

        const collection2 = db.collection('vinted');

        // Charger les données JSON
        const jsonData2 = fs.readFileSync('./combined_VintedDeals.json', 'utf-8');
        const parsedData = JSON.parse(jsonData2);
        // Aplatir les tableaux imbriqués
        const vinted = parsedData.flat(); // Méthode pour aplatir les tableaux
        console.log(`Loaded ${vinted.length} deals from JSON`);

        // Insérer les données dans MongoDB
        const result2 = await collection2.insertMany(vinted);
        console.log(`Inserted ${result2.insertedCount} documents into the collection`);

    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
   
}

async function findBestDiscountDeals(collection, minDiscount = 50) {
  return await collection.find({ discount: { $gte: minDiscount } })
      .sort({ discount: -1 }) // Tri par remise décroissante
      .toArray();
}

async function findMostCommentedDeals(collection, minComments = 10) {
  return await collection.find({ commentCount: { $gte: minComments } })
      .sort({ commentCount: -1 }) // Tri par nombre de commentaires décroissant
      .toArray();
}

async function findDealsSortedByPrice(collection, order = 1) {
  return await collection.find({})
      .sort({ price: order }) // 1 pour croissant, -1 pour décroissant
      .toArray();
}

async function findDealsSortedByDate(collection, order = -1) {
  return await collection.find({})
      .sort({ published: order }) // -1 pour les plus récents en premier
      .toArray();
}

async function findSalesByLegoSetId(collection, legoSetId) {
  return await collection.find({ legoSetId: legoSetId }).toArray();
}

async function findRecentSales(collection, weeks = 3) {
  const currentDate = new Date();
  const pastDate = new Date(currentDate);
  pastDate.setDate(currentDate.getDate() - weeks * 7);

  return await collection.find({ scrapedDate: { $gte: pastDate } }).toArray();
}

async function main() {
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection('dealabs');
  const collection2 = db.collection('vinted');

  //console.log("Best Discount Deals:", await findBestDiscountDeals(collection));
  //console.log("Most Commented Deals:", await findMostCommentedDeals(collection));
  //console.log("Deals Sorted by Price (asc):", await findDealsSortedByPrice(collection, 1));
  //console.log("Deals Sorted by Date (desc):", await findDealsSortedByDate(collection, -1));
  console.log("Sales for LEGO Set ID 77092:", await findSalesByLegoSetId(collection2, 77092));
  //console.log("Sales Scraped in Last 3 Weeks:", await findRecentSales(collection, 3));
}

main();




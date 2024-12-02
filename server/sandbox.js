/* eslint-disable no-console, no-process-exit */
//const avenuedelabrique = await import('./websites/avenuedelabrique');

/*
async function sandbox (website = 'https://www.avenuedelabrique.com/nouveautes-lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const avenuedelabrique = await import('./websites/avenuedelabrique.js');
    const deals = await avenuedelabrique.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

async function sandbox (website = 'https://www.dealabs.com/groupe/lego?hide_expired=true') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const dealabs = await import('./websites/dealabs.js');
    const deals = await dealabs.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
    
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
  */
/*
const [,, eshop] = process.argv;

sandbox(eshop);
*/
/*
const puppeteer = require('puppeteer'); 

async function sandbox2 (ID="75368") {
  const website2 = `https://www.vinted.fr/catalog?search_text=lego%20${ID}&time=1730733272&page=1`;
  const browser = await puppeteer.launch(); 
  try {
    console.log(`🕵️‍♀️  browsing ${website2} website`);

    const dealVinted = await import('./websites/vintedDeals.js');
    const deals = await dealVinted.scrape(website2,browser);

    console.log(deals);
    console.log('done');
  } catch (e) {
    console.error("Error in sandbox2:", e);
  } finally {
    await browser.close(); 
    console.log("Browser closed");
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
*/
const fs = require('fs');
const puppeteer = require('puppeteer');
/*
async function sandbox(website = 'https://www.dealabs.com/groupe/lego?hide_expired=true') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    // Import du scraper Dealabs
    const dealabs = await import('./websites/dealabs.js');
    const legoDeals = await dealabs.scrape(website); // Scraper les IDs Lego depuis Dealabs

    console.log(`Lego Deals from Dealabs:`, legoDeals);

    // Enregistrer les résultats dans un fichier JSON
    const outputPath = './combined_dealLabs.json';
    fs.writeFileSync(outputPath, JSON.stringify(legoDeals, null, 2), 'utf-8');
    console.log(`Deals saved to ${outputPath}`);

    // Vérifiez si des IDs Lego ont été récupérés
    if (Array.isArray(legoDeals) && legoDeals.length > 0) {
      console.log(`Found ${legoDeals.length} Lego IDs. Fetching Vinted deals...`);
      await processVintedDeals(legoDeals); // Appeler une fonction pour scraper Vinted
    } else {
      console.log('No Lego IDs found on Dealabs.');
    }

    console.log('Done scraping Dealabs');
  } catch (e) {
    console.error('Error in Dealabs scraping:', e);
    process.exit(1);
  }
}
*/
/*
async function processVintedDeals(legoDeals) {
  const browser = await puppeteer.launch(); // Lance Puppeteer pour Vinted
  try {
    const vintedScraper = await import('./websites/vintedDeals.js');
    let VintedDeals = [];
    for (const deal of legoDeals) {
      
      console.log(`🔍 Searching Vinted for Lego ID: ${deal.legoID} (${deal.title})`);
      if(deal.legoID!=''){
        const vintedURL = `https://www.vinted.fr/catalog?search_text=lego%20${deal.legoID}&time=1730733272&page=1`;
        const deals = await vintedScraper.scrape(vintedURL, browser);
        VintedDeals.push(deals);
        console.log(`Vinted Deals for Lego ID ${deal.legoID}:`, deals);

      }
    }
    // Enregistrer les résultats dans un fichier JSON
    const outputPath = './combined_VintedDeals.json';
    fs.writeFileSync(outputPath, JSON.stringify(VintedDeals, null, 2), 'utf-8');
    console.log(`Deals saved to ${outputPath}`);

  } catch (e) {
    console.error('Error while scraping Vinted:', e);
  } finally {
    await browser.close(); // Fermez le navigateur après les requêtes
    console.log('Browser closed');
  }
}
*/
async function sandbox(website = 'https://www.dealabs.com/groupe/lego?hide_expired=true') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    // Import du scraper Dealabs
    const dealabs = await import('./websites/dealabs.js');
    const legoDeals = await dealabs.scrapeMultiplePages(website, 3); // Scraper les 3 premières pages

    console.log(`Lego Deals from Dealabs:`, legoDeals);

    // Enregistrer les résultats dans un fichier JSON
    const outputPath = './combined_dealLabs.json';
    fs.writeFileSync(outputPath, JSON.stringify(legoDeals, null, 2), 'utf-8');
    console.log(`Deals saved to ${outputPath}`);

    // Vérifiez si des IDs Lego ont été récupérés
    if (Array.isArray(legoDeals) && legoDeals.length > 0) {
      console.log(`Found ${legoDeals.length} Lego IDs. Fetching Vinted deals...`);
      await processVintedDeals(legoDeals); // Appeler une fonction pour scraper Vinted
    } else {
      console.log('No Lego IDs found on Dealabs.');
    }

    console.log('Done scraping Dealabs');
  } catch (e) {
    console.error('Error in Dealabs scraping:', e);
    process.exit(1);
  }
}


// Fonction pour récupérer les deals sur Vinted
async function processVintedDeals(legoDeals) {
  const browser = await puppeteer.launch(); // Lance Puppeteer pour Vinted
  try {
    const vintedScraper = await import('./websites/vintedDeals.js');
    let VintedDeals = [];

    for (const deal of legoDeals) {
      console.log(`🔍 Searching Vinted for Lego ID: ${deal.legoID} (${deal.title})`);
      if (deal.legoID !== '') {
        let vintedURL = `https://www.vinted.fr/catalog?search_text=lego%20${deal.legoID}&time=1730733272&page=1`;
        let page = 1;

        let fetchedDeals = [];
        // Récupérer 5 pages de résultats
        while (page <= 3) {
          console.log(`Fetching page ${page} for Lego ID ${deal.legoID}`);
          const deals = await vintedScraper.scrape(`${vintedURL}&page=${page}`, browser);
          fetchedDeals = [...fetchedDeals, ...deals]; // Ajouter les résultats de cette page

          page++; // Passer à la page suivante
        }

        // Limiter à 3 deals par Lego ID
        //fetchedDeals = fetchedDeals.slice(0, 3);

        VintedDeals.push({
          legoID: deal.legoID,
          title: deal.title,
          vintedDeals: fetchedDeals
        });
        //console.log(`Vinted Deals for Lego ID ${deal.legoID}:`, fetchedDeals);
      }
    }

    // Enregistrer les résultats dans un fichier JSON
    const outputPath = './combined_VintedDeals.json';
    fs.writeFileSync(outputPath, JSON.stringify(VintedDeals, null, 2), 'utf-8');
    console.log(`Deals saved to ${outputPath}`);
  } catch (e) {
    console.error('Error while scraping Vinted:', e);
  } finally {
    await browser.close(); // Fermez le navigateur après les requêtes
    console.log('Browser closed');
  }
}

// Exécuter le script
const [,, eshop] = process.argv;
sandbox(eshop);

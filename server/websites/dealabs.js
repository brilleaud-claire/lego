const fetch = (...args) => import('node-fetch').then(module => module.default(...args));
const cheerio = require('cheerio');
const fs = require('fs'); // Module fs pour écrire des fichiers

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = data => {
  const $ = cheerio.load(data, { 'xmlMode': true }, true);

  return $('article.thread')
    .map((_, element) => {
      const content = JSON.parse(
        $(element)
          .find('div.js-vue2').attr("data-vue2")
      ).props.thread;

      const imgUrl = JSON.parse(
        $(element).find("div.threadGrid-image div.js-vue2").attr("data-vue2")
      ).props.threadImageUrl;

      const title = content.title;
      const link = content.link;
      const linkDealLabs = content.shareableLink;
      const price = content.price;
      const retail = content.nextBestPrice;
      let discount = 0.0;
      if (retail !== 0.0) {
        discount = Math.round(((1 - (price / retail)) * 100) * 100) / 100;
      }
      const commentCount = content.commentCount;
      const temperature = content.temperature;
      const published = content.publishedAt;

      const idPattern = /\d{5}/;
      const foundLegoID = title.match(idPattern);
      const legoID = foundLegoID === null ? "" : foundLegoID[0];

      return {
        discount,
        link,
        price,
        title,
        imgUrl,
        legoID,
        retail,
        commentCount,
        temperature,
        published,
        linkDealLabs,
      };
    })
    .get();
};

/**
 * Scrape a given url page with pagination support
 * @param {String} baseUrl - url to parse without the page parameter
 * @param {Number} maxPages - maximum number of pages to scrape
 * @returns 
 */
module.exports.scrapeMultiplePages = async (baseUrl, maxPages = 5) => {
  let allDeals = [];
  let currentPage = 1;

  // Iterate through each page
  while (currentPage <= maxPages) {
    const url = `${baseUrl}&page=${currentPage}`;
    console.log(`Scraping page ${currentPage}: ${url}`);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
      }
    });

    if (response.ok) {
      const body = await response.text();
      const dealLabs = parse(body);

      if (dealLabs.length > 0) {
        allDeals = [...allDeals, ...dealLabs]; // Ajouter les nouveaux résultats
        console.log(`Page ${currentPage} scraped, found ${dealLabs.length} deals.`);
      } else {
        console.log(`No deals found on page ${currentPage}.`);
        break; // Arrêter si aucune donnée n'est trouvée
      }
    } else {
      console.error(`Failed to fetch page ${currentPage}: ${response.statusText}`);
      break; // Arrêter si une page échoue à être récupérée
    }

    currentPage++;
  }

  return allDeals;
};

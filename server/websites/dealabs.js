//const fetch = require('node-fetch');
const fetch = (...args) => import('node-fetch').then(module => module.default(...args));
const cheerio = require('cheerio');
const fs = require('fs'); // Module fs pour écrire des fichiers

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = data => {
  const $ = cheerio.load(data, {'xmlMode': true}, true);

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
      if(retail!=0.0){
        discount = Math.round(((1-(price/retail))*100) * 100) / 100;
      }
      const commentCount = content.commentCount;
      const temperature = content.temperature;
      const published = content.publishedAt;

      const idPattern = /\d{5}/;
      const foundLegoID=title.match(idPattern);
      const legoID=foundLegoID===null ? "": foundLegoID[0];

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
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns 
 */

// I had problems to fetch the data from dealabs so I used a User-Agent to make it beleive I was a real user. 
module.exports.scrape = async url => {
    const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
        }
      });

  if (response.ok) {
    const body = await response.text();
    const dealLabs = parse(body)

    if (dealLabs.length > 0) { // Assurez-vous qu'il y a des données à écrire
      fs.writeFileSync('deals.json', JSON.stringify(dealLabs, null, 2), 'utf-8', (err) => {
        if (err) {
          console.error("Erreur lors de l'écriture du fichier JSON:", err);
        } else {
          console.log("Données enregistrées dans deals.json");
        }
      });
      
    } else {
      console.log("Aucune donnée extraite pour l'enregistrement.");
    }
    return dealLabs;
  }

  console.error(response);

  return null;
};
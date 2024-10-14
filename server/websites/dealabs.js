//const fetch = require('node-fetch');
const fetch = (...args) => import('node-fetch').then(module => module.default(...args));
const cheerio = require('cheerio');

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = data => {
  const $ = cheerio.load(data, {'xmlMode': true});

  return $('div.threadGrid-title js-contextual-message-placeholder')
    .map((i, element) => {
      const price = parseFloat(
        $(element)
          .find('span.vAlign--all-tt')
          .text()
      );
      
      const discount = Math.abs(parseInt(
        $(element)
          .find('span.text--color-charcoal space--ml-1 size--all-l size--fromW3-xl')
          .text()
      ));

      return {
        discount,
        price,
        'title': $(element).attr('title'),
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
    console.log("Je suis rentrée dans le site");
    return parse(body);
  }

  console.error(response);

  return null;
};
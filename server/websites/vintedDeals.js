const fetch = (...args) => import('node-fetch').then(module => module.default(...args));

async function fetchWithAuth(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.message}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
}
/**
 * Fetch data from Vinted API for a given Lego ID
 * @param {String} id - Lego set ID (optional, defaults to "75368")
 * @returns {Object|null} - Vinted deal data or null on error
 */
const fetchDeals = async (id = "75368") => {
  try {
    const token = '75f6c9fa-dc8e-4e52-a000-e09dd4084b3e'; 
    const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1731770253&search_text=lego+${id}&catalog_ids=&size_ids=&brand_ids=&status_ids=&color_ids=&material_ids=`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
        'Cf-Ray':'8e3986b4ed8604a0-CDG'
      }
    });
    const body = await response.json();
    console.log(body);
    return body.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Scrape a given url page and retrieve price and title from Vinted API
 * @param {String} url - url to parse
 * @returns {Object|null} - Vinted deal data (price & title) or null on error
 */
module.exports.scrape = async (url) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
    }
  });

  if (response.ok) {
    const body = await response.text();
    // Extract the ID from search_text parameter
    const regex = /lego%20(\d+)/;
    const match = url.match(regex);
    let extractedID = "";
    if (match) {
      extractedID = match[1];
      console.log("Extracted ID:", extractedID);
    } else {
      console.error("ID not found in the URL");
    }
    // Fetch Vinted deals using extracted ID
    const VintedDeals = await fetchDeals(extractedID);

    if (VintedDeals) {
      const price = VintedDeals.total_item_price.amount;
      const title = VintedDeals.item_box.first_line;
      return { title, price };
    } else {
      console.log("No data found for the URL.");
    }
  } else {
    console.error("Error fetching URL:", response);
    return null;
  }
};
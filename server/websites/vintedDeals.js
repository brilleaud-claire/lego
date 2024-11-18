const fetch = (...args) => import('node-fetch').then(module => module.default(...args));
const puppeteer = require('puppeteer'); 
// Récupérez les cookies depuis Vinted
const getVintedCookies = async (page) => {
  // Naviguez vers la page Vinted
  await page.goto("https://www.vinted.fr", { waitUntil: "networkidle2" });

  // Récupérez les cookies
  const cookies = await page.cookies();

  // Convertissez les cookies en une chaîne
  const cookieString = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
  //console.log("Cookies récupérés :", cookieString);
  return cookieString;
};

/**
 * Fetch data from Vinted API for a given Lego ID
 * @param {String} id - Lego set ID (optional, defaults to "75368")
 * @param {String} cookieString - Cookies in string format for authorization
 * @returns {Object|null} - Vinted deal data or null on error
 */
// Fetch des offres depuis l'API Vinted
const fetchDeals = async (id = "75368", cookieString, page) => {
  const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1731770253&search_text=lego+${id}`;
  try {
    console.log("Tentative de requête avec URL :", url);

    // Injectez les cookies dans le contexte de la page
    const cookiesArray = cookieString.split("; ").map((cookie) => {
      const [name, value] = cookie.split("=");
      return { name, value, domain: ".vinted.fr" };
    });
    await page.setCookie(...cookiesArray);
    // Requête via Puppeteer
    const response = await page.evaluate(async (url,cookieString) => {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json, text/plain, */*",
          "Cookie": cookieString,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Cache-Control": "max-age=0",
        },
      });

      if (!res.ok) throw new Error(`Erreur HTTP : ${res.status}`);
      return await res.json();
    }, url);
    return response?.items || [];
  } catch (error) {
    console.error("Erreur lors de la requête fetchDeals :", error);
    return null;
  }
};

/**
 * Scrape a given url page and retrieve price and title from Vinted API
 * @param {String} url - url to parse
 * @param {Object} browser - Puppeteer browser instance
 * @returns {Object|null} - Vinted deal data (price & title) or null on error
 */
module.exports.scrape = async (url, browser) => {
  const page = await browser.newPage();
  const cookieString = await getVintedCookies(page);
  
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
  const VintedDeals = await fetchDeals(extractedID, cookieString, page);
  console.log(VintedDeals);
  
  if (Array.isArray(VintedDeals)) {
    const deals = VintedDeals.map((deal) => ({
      title: deal.title,
      price: deal.price ? `${deal.price.amount}` : "N/A",
    }));

    await page.close();
    return deals;
  } else {
    console.log("No data found for the URL.");
    await page.close();
    return [];
  }
};

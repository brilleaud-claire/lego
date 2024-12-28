// Invoking strict mode
'use strict';

// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals
GET https://lego-server-claire.vercel.app/deals/search
Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `limit` - number of deals to return
- `price` - under a certain price
- `date` - sort by date
- `best-discount` - sort by discount
- `most-commented` - sort by most commented

GET https://lego-api-blue.vercel.app/sales
GET https://lego-server-claire.vercel.app/sales/search

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `legoSetId` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

// current deals on the page
let currentDealsVinted = [];
let currentPaginationVinted = {};

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectFilter = document.querySelector('#filters');
const selectSort = document.querySelector('#sort');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals = document.querySelector('#deals');
const sectionDealsVinted = document.querySelector('#VintedDeals');
const spanNbDeals = document.querySelector('#nbDeals');
const spanNbSales = document.querySelector('#nbSales');
const filterFavoritesCheckbox = document.querySelector('#filter-favorites-checkbox');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({ results, pagination }) => {
  currentDeals = results;
  currentPagination = pagination;
};

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDealsVinted = ({ results, pagination }) => {
  currentDealsVinted = results;
  currentPaginationVinted = pagination;
};

/**
 * Fetch deals from API
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [limit=12] - number of deals per page
 * @return {Object}
 */
const fetchDeals = async (page = 1, limit = 12) => {
  try {
    const response = await fetch(`https://lego-server-claire.vercel.app/deals/?page=${page}&limit=${limit}`);
    const body = await response.json();

    if (response.ok) {
      return { results: body.results, pagination: body.pagination };
    } else {
      console.error(body);
      return { results: currentDeals, pagination: currentPagination };
    }
  } catch (error) {
    console.error(error);
    return { results: currentDeals, pagination: currentPagination };
  }
};

/**
 * Fetch Vinted deals from API
 * @param  {String}  [legoSetId="21345"] - LEGO set ID to fetch deals for
 * @return {Object}
 */
const fetchVintedDeals = async (legoSetId = "21345") => {
  try {
    const response = await fetch(`https://lego-server-claire.vercel.app/sales/search?legoID=${legoSetId}`);
    const body = await response.json();
    console.log(`https://lego-server-claire.vercel.app/sales/search?legoID=${legoSetId}`);
    if (response.ok) {
      // Extraire les "vintedDeals" depuis chaque élément dans "results"
      const deals = body.results.flatMap(item => item.vintedDeals.map(deal => ({
        id: deal.id,
        title: deal.title,
        price: deal.price,
        url: deal.url,
        date: deal.date
      })));
      
      // calculer les prix pour les indicateurs
      const prices = deals.map(deal => parseFloat(deal.price));
      
      return { deals, prices };
    } else {
      console.error("Erreur dans la récupération des données:", body);
      return { deals: [], prices: [] };
    }
  } catch (error) {
    console.error("Erreur lors de l'appel API:", error);
    return { deals: [], prices: [] };
  }
};



/**
 * Render list of deals
 * @param  {Array} deals - list of deals to display
 */
const renderDeals = deals => {
  // Filtrer les deals avec un legoID
  sectionDeals.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  div.classList.add('content');
  div.innerHTML = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <div class="image-container">
          <img src="${deal.imgUrl}" alt="Deal Image">
        </div>
        <div class="deal-text">
          <div class="deal-info">
            <span>ID: ${deal.legoID}</span>
            <button class="favorite-btn" data-deal-id="${deal.uuid}">Save as Favorite</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <a href="${deal.link}" target="_blank">${deal.title}</a>
          </div>
          <div class="deal-info">
            <div class="deal-info__label">Price :</div>
            <div class="deal-info__value">${deal.retail}€</div>
            <div class="deal-info__value deal-info__price">${deal.price}€</div>
            <div class="deal-info__value deal-info__discount">-${deal.discount}%</div>
          </div>
          <div class="seeDealsContent">
            <button class="button see-deals" data-see-deal-id="${deal.legoID}" data-price="${deal.price}">See Deals</button>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
  fragment.appendChild(div);
  sectionDeals.appendChild(fragment);

  // Add event listeners to the "Favorite" buttons
  const favoriteButtons = document.querySelectorAll('.favorite-btn');
  favoriteButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const dealId = event.target.getAttribute('data-deal-id');
      saveDealAsFavorite(dealId);
    });
  });

  // Add event listeners to the "See Deals" buttons
  const seeDealsButtons = document.querySelectorAll('.see-deals');
  seeDealsButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const dealId = event.target.getAttribute('data-see-deal-id');
      const priceDealab = event.target.getAttribute('data-price');
      
      // Fetch the Vinted deals for this ID
      const { deals, prices } = await fetchVintedDeals(dealId);
      console.log(dealId);
      // Calculate price statistics
      const indicators = calculatePriceStatistics(prices);
      indicators.nbSales = deals.length;

      // Open the new window with Vinted deals and indicators
      console.log(dealId, priceDealab);
      openVintedDealsWindow(deals, indicators, priceDealab);
    });
  });
};

/**
 * Render list of Vinted deals
 * @param  {Array} deals - list of deals to display
 */
const renderDealsVinted = deals => {
  sectionDealsVinted.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  div.classList.add('content');
  div.innerHTML = deals
    .map(deal => {
      return `
      <div class="sale" id=${deal.id}>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="${deal.url}" target="_blank">View Sale</a>
          <span>Price: ${deal.price}€</span>
          <span>Published: ${new Date(deal.published).toLocaleDateString()}</span>
        </div>
      </div>
    `;
    })
    .join('');
  fragment.appendChild(div);
  sectionDealsVinted.appendChild(fragment);
};



const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  //renderIndicators(pagination);
  //renderLegoSetIds(deals)
};

const renderVinted = (deals, pagination) => {
  renderDealsVinted(deals);
  //renderPagination(pagination);
  //renderIndicators(pagination);
  //renderLegoSetIds(deals)
};


/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */

const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Save deal as favorite
 * @param {String} dealId - ID of the deal to save
 */
const saveDealAsFavorite = (dealId) => {
  const favoriteDeals = JSON.parse(localStorage.getItem('favoriteDeals')) || [];

  // Find the deal by ID from current deals
  const deal = currentDeals.find(d => d.uuid === dealId);

  if (deal) {
    // Check if deal is already saved
    const isAlreadySaved = favoriteDeals.some(favDeal => favDeal.uuid === dealId);

    if (!isAlreadySaved) {
      favoriteDeals.push(deal);
      localStorage.setItem('favoriteDeals', JSON.stringify(favoriteDeals));
      alert('Deal saved as favorite!');
    } else {
      alert('This deal is already in your favorites.');
    }
  } else {
    alert('Deal not found!');
  }
};


const openVintedDealsWindow = async (deals, indicators, priceDealab) => {
  // Vérification des données
  if (!deals || !Array.isArray(deals) || deals.length === 0) {
    console.error("Aucun deal trouvé");
    return;
  }

  if (!indicators) {
    console.error("Aucun indicateur trouvé");
    return;
  }
  if (!priceDealab) {
    console.error("Aucun prix trouvé");
    return;
  }

  // Calculer le lifetime moyen
  const averageLifetime = calculateAverageLifetime(deals);

  // Calculer l'indicateur good deal 
  const x = indicators.average;
  const goodDealValue = calculateGoodDeal(x, priceDealab, averageLifetime);

  // Ouvrir une nouvelle fenêtre
  const vintedWindow = window.open('', '_blank', 'width=800,height=600');

  if (!vintedWindow) {
    console.error("Impossible d'ouvrir la fenêtre");
    return;
  }

  // Calculer la couleur de la pastille
  let badgeClass = '';
  let badgetitle = '';
  if (goodDealValue < 0) {
    badgeClass = 'badge-red';
    badgetitle = 'Very bad deal (no marge on the price)';
  } else if (goodDealValue >= 0 && goodDealValue < 0.5) {
    badgeClass = 'badge-orange';
    badgetitle = 'Not so good a deal (Not a big marge or the article are here for a long time)';
  } else if (goodDealValue >= 0.5) {
    badgeClass = 'badge-green';
    badgetitle = 'This is a sweet deal my friend !';
  }

  // Construire le contenu HTML de la nouvelle fenêtre
  vintedWindow.document.write(`
    <html>
      <head>
        <title>Vinted Deals</title>
        <style>
          body { display: flex; font-family: Arial, sans-serif; }
          .container { display: flex; width: 100%; }
          .indicators { width: 30%; padding: 20px; border-left: 2px solid #ddd; }
          .deals-table { width: 70%; padding: 20px; }
          .good-deal-indicator {display: flex;flex-direction: column;align-items: center; }
          .good-deal-label {font-size: 1rem;margin-bottom: 0.5rem;}
          .badge {width: 20px;height: 20px;border-radius: 50%;border: 1px solid #ccc;}
          .badge-red {background-color: red; }
          .badge-orange { background-color: orange; }
          .badge-green {background-color: green; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          th { background-color: #f2f2f2; }
          a { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="deals-table">
            <h2>Vinted Deals</h2>
            <table>
              <thead>
                <tr>
                  <th>Price (€)</th>
                  <th>Publication Date</th>
                  <th>Link</th>
                  <th>Lifetime</th>
                </tr>
              </thead>
              <tbody id="vintedDealsTableBody">
              </tbody>
            </table>
          </div>
          <div class="indicators">
            <h2>Indicators</h2>
            <p><strong>Number of sales:</strong> <span id="nbSales">${indicators.nbSales}</span></p>
            <p><strong>Average price:</strong> <span id="averagePrice">${indicators.average} €</span></p>
            <p><strong>P25 (bottom of the basket):</strong> <span id="p25Price">${indicators.p25} €</span></p>
            <p><strong>P50 (middle of the basket):</strong> <span id="p50Price">${indicators.p50} €</span></p>
            <p><strong>P95 (top of the basket):</strong> <span id="p95Price">${indicators.p95} €</span></p>
            <p><strong>Average lifetime:</strong> <span id="averageLifetime">${averageLifetime} jours</span></p>
            <p><strong>Good Deal:</strong> <span id="averageGoodDeal">${goodDealValue}</span></p>
            <div class="good-deal-indicator">
              <p class="good-deal-label">${badgetitle}</p>
              <div class="badge ${badgeClass}"></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);

  // Injecter les données des Vinted Deals dans le tableau
  const vintedDealsTableBody = vintedWindow.document.getElementById('vintedDealsTableBody');

  deals.forEach(deal => {
    if (deal.price && deal.date && deal.url) {
      const lifetime = calculateLifetime(deal.date); // Convertir en format lisible
      const row = vintedWindow.document.createElement('tr');
      row.innerHTML = `
        <td>${deal.price}€</td>
        <td>${new Date(deal.date * 1000).toLocaleDateString()}</td>
        <td><a href="${deal.url}" target="_blank">Go to vinted</a></td>
        <td>${lifetime}</td>
      `;
      vintedDealsTableBody.appendChild(row);
    }
  });
};


/**
 * Calculate the "Good Deal" indicator for a deal
 * @param {Number} x - Average price (average vinted) or median price (p50)
 * @param {Number} dealPrice - Price of the deal
 * @param {Number} averageLifetime - Average lifetime in days
 * @return {Number} - Good Deal indicator value
 */
const calculateGoodDeal = (x, dealPrice, averageLifetime) => {
  if (averageLifetime === 0) return 0; // Avoid division by zero
  return ((x - dealPrice) / averageLifetime).toFixed(2);
};


/**
 * Calculate the average lifetime of deals in days
 * @param {Array} deals - List of deals with a `date` property (Unix timestamp)
 * @return {Number} - Average lifetime in days
 */
const calculateAverageLifetime = (deals) => {
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds

  const lifetimesInDays = deals.map(deal => {
    const diffInSeconds = now - deal.date;
    return Math.floor(diffInSeconds / (3600 * 24)); // Convert seconds to days
  });

  const totalLifetime = lifetimesInDays.reduce((sum, lifetime) => sum + lifetime, 0);
  return (totalLifetime / lifetimesInDays.length).toFixed(2); // Return average with 2 decimals
};


/**
 * Calculate statistics like average, p25, p50 (median), p95.
 * @param  {Array} prices - list of prices
 * @return {Object} - object with average, p25, p50, p95 values
 */
const calculatePriceStatistics = prices => {
  // Convert strings to numbers and filter out invalid entries
  const validPrices = prices
    .map(price => parseFloat(price)) // Convert to float
    .filter(price => !isNaN(price)); // Ensure valid numbers

  if (!validPrices.length) return { average: 0, p25: 0, p50: 0, p95: 0 };

  validPrices.sort((a, b) => a - b); // Sort prices in ascending order

  const average = (validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length).toFixed(2);
  const p25 = validPrices[Math.floor(validPrices.length * 0.25)]?.toFixed(2);
  const p50 = validPrices[Math.floor(validPrices.length * 0.5)]?.toFixed(2); // Median
  const p95 = validPrices[Math.floor(validPrices.length * 0.95)]?.toFixed(2);

  return { average, p25, p50, p95 };
};

/**
 * Calculate the lifetime value (in days) from the published timestamp.
 * @param {Number} published - Unix timestamp of when the deal was published
 * @return {String} - The lifetime in a human-readable format
 */
const calculateLifetime = published => {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const diffInSeconds = now - published;
  const diffInDays = Math.floor(diffInSeconds / (3600 * 24)); // Convert seconds to days

  if (diffInDays < 1) {
    return "Published today";
  } else if (diffInDays === 1) {
    return "Published 1 day ago";
  } else if (diffInDays < 30) {
    return `Published ${diffInDays} days ago`;
  } else if (diffInDays < 365) {
    const diffInMonths = Math.floor(diffInDays / 30);
    return `Published ${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  } else {
    const diffInYears = Math.floor(diffInDays / 365);
    return `Published ${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

filterFavoritesCheckbox.addEventListener('change', () => {
  if (filterFavoritesCheckbox.checked) {
    // Filter and display only favorite deals
    renderFavoriteDeals();
  } else {
    // Display all deals
    render(currentDeals, currentPagination);
  }
});

/**
 * Filter by discount, hot deals and temperature
 */
selectFilter.addEventListener('click', async (event) => {
  const target = event.target;
  const deals = await fetchDeals(currentPagination.currentPage, selectShow.value);
  // Ensure the click was on a button
  if (target.tagName !== 'BUTTON') return;

  setCurrentDeals(deals);

  if (target.classList.contains('discount')) {
    // Fetch and filter by discount
    currentDeals = currentDeals.filter(item => item.discount >=50); 
  }
  else if (target.classList.contains('most-commented')) {
    // Fetch and filter by most commented
    currentDeals = currentDeals.filter(item => item.commentCount >=15);
  } 
  else if (target.classList.contains('hot-deals')) {
    // Fetch and filter by hot deals
    currentDeals = currentDeals.filter(item => item.temperature >=100);
  }
  // Update the UI with filtered results
  
  renderDeals(currentDeals, currentPagination);

})


/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Select the page to display
 */
selectPage.addEventListener('change', async (event) => {
  const deals = await fetchDeals(parseInt(event.target.value), selectShow.value);

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Filter by discount, hot deals and temperature
 */
selectSort.addEventListener('click', async (event) => {
  const target = event.target;
  const deals = await fetchDeals(currentPagination.currentPage, selectShow.value);
  // Ensure the click was on a button
  if (target.tagName !== 'BUTTON') return;

  setCurrentDeals(deals);

  if (target.classList.contains('price-asc')) {
    // Fetch and filter by discount
    currentDeals = currentDeals.sort((a, b) => a.price - b.price);
  }
  else if (target.classList.contains('price-desc')) {
    // Fetch and filter by discount
    currentDeals = currentDeals.sort((a, b) => b.price - a.price); 
  } 
  else if (target.classList.contains('date-asc')) {
    // Fetch and filter by discount
    currentDeals = currentDeals.sort((a, b) => b.published - a.published);
  }
  else if (target.classList.contains('date-desc')) {
    // Fetch and filter by discount
    currentDeals = currentDeals.sort((a, b) => a.published - b.published); 
  }
  // Update the UI with filtered results
  
  renderDeals(currentDeals, currentPagination);

})
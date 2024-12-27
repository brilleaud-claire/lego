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
const sectionDeals= document.querySelector('#deals');
const sectionDealsVinted= document.querySelector('#VintedDeals');
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

    if (response.ok) {
      const prices = body.results.map(deal => deal.price);
      return { deals: body.results, prices };
    } else {
      console.error(body);
      return { deals: currentDealsVinted, prices: [] };
    }
  } catch (error) {
    console.error(error);
    return { deals: currentDealsVinted, prices: [] };
  }
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
 * Render list of deals (regular or favorite)
 * @param  {Array} deals - list of deals to display
 */
const renderDeals = deals => {
  const sectionDeals = document.getElementById('deals'); // Définissez l'endroit pour les deals
  sectionDeals.innerHTML = ''; // Vide le conteneur
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  div.classList.add('content'); // Add the "content" class
  const template = deals
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
            <button class="button see-deals" data-see-deal-id="${deal.uuid}">See Deals</button>
          </div>
        </div>
      </div>
    `;
    })
    .join('');
  
  div.innerHTML = template;
  console.log(deals);
  fragment.appendChild(div);
  //sectionDeals.innerHTML = '<h2>Deals</h2>';
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
      
      // Fetch the Vinted deals for this ID
      const { deals, prices } = await fetchVintedDeals(dealId);

      // Calculate price statistics
      const indicators = calculatePriceStatistics(prices);
      indicators.nbSales = deals.length;

      // Open the new window with Vinted deals and indicators
      openVintedDealsWindow(deals, indicators);
    });
  });
};


/**
 * Open a new window to display Vinted deals for a specific LEGO set ID
 * @param {String} legoSetId - ID of the LEGO set to fetch deals for
 */
// Fonction pour ouvrir une nouvelle fenêtre et afficher les deals et indicateurs Vinted
const openVintedDealsWindow = async (deals, indicators) => {
  // Ouvrir une nouvelle fenêtre
  console.log(indicators);
  const vintedWindow = window.open('', '_blank', 'width=800,height=600');

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
                  <th>Prix (€)</th>
                  <th>Date de Publication</th>
                  <th>Lien</th>
                </tr>
              </thead>
              <tbody id="vintedDealsTableBody">
              </tbody>
            </table>
          </div>
          <div class="indicators">
            <h2>Indicators</h2>
            <p><strong>Nombre de ventes:</strong> <span id="nbSales">${indicators.nbSales}</span></p>
            <p><strong>Prix moyen:</strong> <span id="averagePrice">${indicators.average}</span></p>
            <p><strong>P25:</strong> <span id="p25Price">${indicators.p25}</span></p>
            <p><strong>P50 (médiane):</strong> <span id="p50Price">${indicators.p50}</span></p>
            <p><strong>P95:</strong> <span id="p95Price">${indicators.p95}</span></p>
          </div>
        </div>
      </body>
    </html>
  `);

  // Injecter les données des Vinted Deals dans le tableau
  const vintedDealsTableBody = vintedWindow.document.getElementById('vintedDealsTableBody');
  deals.forEach(deal => {
    const row = vintedWindow.document.createElement('tr');
    row.innerHTML = `
      <td>${deal.price}€</td>
      <td>${new Date(deal.date * 1000).toLocaleDateString()}</td>
      <td><a href="${deal.url}" target="_blank">Voir le deal</a></td>
    `;
    vintedDealsTableBody.appendChild(row);
  });
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

/**
 * Render list of favorite deals (filtered)
 */
const renderFavoriteDeals = () => {
  const favoriteDeals = JSON.parse(localStorage.getItem('favoriteDeals')) || [];

  if (favoriteDeals.length === 0) {
    sectionDeals.innerHTML = '<p>No favorite deals saved yet.</p>';
    return;
  }

  renderDeals(favoriteDeals); // Use the same renderDeals function to show favorite deals
};

/*
// Load favorite deals when the page loads
document.addEventListener('DOMContentLoaded', () => {
  renderFavoriteDeals();
});
*/
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

/**
 * Render list of deals Vinted with lifetime values
 * @param  {Array} deals
 */
const renderDealsVinted = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      const lifetime = calculateLifetime(deal.date); // Calculate lifetime for each deal
      return `
      <div class="sale VintedDeals" id=${deal.id}>
      <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="${deal.link}" target="_blank">${deal.title}</a>
        <span>Price: ${deal.price}</span>
        <span>Lifetime: ${lifetime}</span> 
        <span> </span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  if (sectionDealsVinted) {
    sectionDealsVinted.innerHTML = '<h3>Vinted Deals</h3>';
    sectionDealsVinted.appendChild(fragment);
  } else {
    console.error("Element sectionDealsVinted not found");
  }
}

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
 * Declaration of all Listeners
 */

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
 * Select the id vinted to display
 
selectLegoSetIds.addEventListener('change', async (event) => {
  const { deals, prices } = await fetchVintedDeals(event.target.value);

  spanNbSales.innerHTML = deals.length;

  const { average, p25, p50, p95 } = calculatePriceStatistics(prices);
  // Display price statistics
  document.querySelector('#averagePrice').textContent = `Average: ${average}`;
  document.querySelector('#p25Price').textContent = `P25: ${p25}`;
  document.querySelector('#p50Price').textContent = `P50: ${p50}`;
  document.querySelector('#p95Price').textContent = `P95: ${p95}`;

  setCurrentDealsVinted(deals);
  renderVinted(deals, currentPaginationVinted);
}); */

/**
 * Sort by price and date
 
selectSort.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, selectShow.value);
  const target = event.target;
  setCurrentDeals(deals);
  if (target.value=='price-asc') {
    // Fetch and filter by discount
    currentDeals = currentDeals.sort((a, b) => a.price - b.price); 
  }
  else if (target.value=='price-desc') {
    // Fetch and filter by discount
    currentDeals = currentDeals.sort((a, b) => b.price - a.price); 
  }
  else if (target.value=='date-asc') {
    // Fetch and filter by discount
    currentDeals = currentDeals.sort((a, b) => b.published - a.published); 
  }
  else if (target.value=='date-desc') {
    // Fetch and filter by discount
    currentDeals = currentDeals.sort((a, b) => a.published - b.published); 
  }
  render(currentDeals, currentPagination);
});
*/

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
    currentDeals = currentDeals.filter(item => item.comments >=15);
  } 
  else if (target.classList.contains('hot-deals')) {
    // Fetch and filter by hot deals
    currentDeals = currentDeals.filter(item => item.temperature >=100);
  }
  // Update the UI with filtered results
  
  renderDeals(currentDeals, currentPagination);

})

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

Feature 15 - Usable and pleasant UX
As a user
I want to parse a usable and pleasant web page
So that I can find valuable and useful content
*/
//-----------------------------------------------------------------------------------------------------------------

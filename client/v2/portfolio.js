// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
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
const selectSort = document.querySelector('#sort-select');
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
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDealsVinted = ({result, meta}) => {
  currentDealsVinted = result;
  currentPaginationVinted = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Fetch deals Vinted from api 
 * @param  {String}  [id="21345"] - current ID to fetch
 * @return {Object}
 */
const fetchVintedDeals = async (id = "21345") => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/sales?id=${id}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDealsVinted, currentPaginationVinted};
    }
    const prices = body.data.result.map(deal => deal.price); // Extract prices
    return { deals: body.data.result, prices }; // Return both deals and prices
    //console.log(deals);
    //console.log(prices);
  } catch (error) {
    console.error(error);
    return {currentDealsVinted, currentPaginationVinted};
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
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <img src="${deal.photo}" alt="Deal Image"/>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <span>ID: ${deal.id}</span>
          <a href="${deal.link}" target="_blank">${deal.title}</a>
      </div>
        <span>Price: ${deal.price}</span>
        <button class="favorite-btn" data-deal-id="${deal.uuid}">Save as Favorite</button> 
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);

  // Add event listeners to the "Favorite" buttons
  const favoriteButtons = document.querySelectorAll('.favorite-btn');
  favoriteButtons.forEach(button => {
    button.addEventListener('click', (event) => {
      const dealId = event.target.getAttribute('data-deal-id');
      saveDealAsFavorite(dealId);
    });
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

// Load favorite deals when the page loads
document.addEventListener('DOMContentLoaded', () => {
  renderFavoriteDeals();
});

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
      const lifetime = calculateLifetime(deal.published); // Calculate lifetime for each deal
      return `
      <div class="VintedDeals" id=${deal.uuid}>
      <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="${deal.link}" target="_blank">${deal.title}</a>
        <span>Price: ${deal.price}</span>
        <span>Lifetime: ${lifetime}</span> <!-- Display lifetime here -->
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
  renderIndicators(pagination);
  renderLegoSetIds(deals)
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
 */
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
});

/**
 * Sort by price and date
 */
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
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
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};

/**
 * Render list of deals Vinted
 * @param  {Array} deals
 */
const renderDealsVinted = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="VintedDeals" id=${deal.uuid}>
        
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
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



/**

Feature 9 - average, p25, p50 and p95 price value indicators
As a user for a given set id
I want to indicate the average, p5, p25 and p50 price value
So that I can understand the sales prices for a given set

Feature 10 - Lifetime value
As a user for a given set id
I want to indicate the Lifetime value
So that I can understand how long a set exists on Vinted

Feature 11 - Open product link
As a user
I want to open deal link in a new page
So that I can buy the product easily

Feature 12 - Open sold item link
As a user
I want to open sold item link in a new page
So that I can understand the sold item easily

Feature 13 - Save as favorite
As a user
I want to save a deal as favorite
So that I can retreive this deal later

Feature 14 - Filter by favorite
As a user
I want to filter by favorite deals
So that I can load only my favorite deals

Feature 15 - Usable and pleasant UX
As a user
I want to parse a usable and pleasant web page
So that I can find valuable and useful content
*/
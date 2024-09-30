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

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectFilter = document.querySelector('#filters');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

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
        <span>${deal.discount}</span>
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
  // Update the UI with filtered results
  
  renderDeals(currentDeals, currentPagination);

})


selectPage.addEventListener('change', async (event) => {
  const deals = await fetchDeals(parseInt(event.target.value), selectShow.value);

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
Feature 2 - Filter by best discount
As a user
I want to filter by best discount
So that I can browse deals with a discount more important than 50%

Feature 3 - Filter by most commented
As a user
I want to filter by most commented deals
So that I can browse deals with more than 15 comments

Feature 4 - Filter by hot deals
As a user
I want to filter by hot deals
So that I can browse deals with a temperature more important than 100

Feature 5 - Sort by price
As a user
I want to sort by price
So that I can easily identify cheapest and expensive deals

Feature 5 - Sort by date
As a user
I want to sort by date
So that I can easily identify recent and old deals

Feature 7 - Display Vinted sales
As a user for a given set id
I want to display vinted sales
So that I can easily identify current sales for a given set id

Feature 8 - Specific indicators
As a user for a given set id
I want to indicate the total number of sales
So that I can understand the sales market

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
/* eslint-disable no-console, no-process-exit */
//const avenuedelabrique = await import('./websites/avenuedelabrique');

/*
async function sandbox (website = 'https://www.avenuedelabrique.com/nouveautes-lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const avenuedelabrique = await import('./websites/avenuedelabrique.js');
    const deals = await avenuedelabrique.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
*/
async function sandbox (website = 'https://www.dealabs.com/groupe/lego?hide_expired=true') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const dealabs = await import('./websites/dealabs.js');
    const deals = await dealabs.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
/*
const [,, eshop] = process.argv;

sandbox(eshop);
*/
async function sandbox2 (ID="75368") {
  const website2 = `https://www.vinted.fr/catalog?search_text=lego%20${ID}&time=1730733272&page=1`;
  try {
    console.log(`🕵️‍♀️  browsing ${website2} website`);

    const dealVinted = await import('./websites/vintedDeals.js');
    const deals = await dealVinted.scrape(website2);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop2] = process.argv;

sandbox2(eshop2);


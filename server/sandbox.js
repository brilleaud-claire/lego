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
async function sandbox (website = 'https://www.dealabs.com/groupe/lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const avenuedelabrique = await import('./websites/dealabs.js');
    const deals = await avenuedelabrique.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);

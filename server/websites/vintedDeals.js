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
 * Fetch data from Vinted API for a given Lego ID
 * @param {String} id - Lego set ID (optional, defaults to "75368")
 * @param {String} cookieString - Cookies in string format for authorization
 * @returns {Object|null} - Vinted deal data or null on error
 */
// Fetch des offres depuis l'API Vinted
const fetchDeals2 = async (id = "75368") => {
  const url = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1731770253&search_text=lego+${id}`;
  try {
    console.log("Tentative de requête avec URL :", url);

    const res2 = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1731935719&search_text=lego+${id}&catalog_ids=&size_ids=&brand_ids=&status_ids=&color_ids=&material_ids=`, {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "fr",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "traceparent": "00-00000000000000003b22b71aae77b3aa-33ac352c28e8c7d4-00",
        "x-anon-id": "1647353b-2247-4041-9d0f-e706f133d04a",
        "x-csrf-token": "75f6c9fa-dc8e-4e52-a000-e09dd4084b3e",
        "x-datadog-origin": "rum",
        "x-datadog-parent-id": "3723409455709734868",
        "x-datadog-sampling-priority": "0",
        "x-datadog-trace-id": "4261169522670023594",
        "x-money-object": "true",
        "cookie": "v_udt=S3plNlg2blJmNHA0ajFEYTFtSEJUWVF3QmJTNS0tb05jOWZuZk1NOEhBNUUwRS0tSDFRMkRjN2pJWUFjcDloQTZoUXEyUT09; anon_id=1647353b-2247-4041-9d0f-e706f133d04a; anonymous-locale=fr; ab.optOut=This-cookie-will-expire-in-2025; OptanonAlertBoxClosed=2024-11-04T15:12:39.000Z; eupubconsent-v2=CQHkARgQHkARgAcABBENBOFgAAAAAAAAAChQAAAAAAFBIIIACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBhwDKAMsAbIA74B7AHxAPsA_QCAAEUgIuAjABGgCggFQAKuAXMAxQBogDaAG4AOIAh0BIgCdgFDgKPAUiApsBbAC5AF3gLzAYaAyQBk4DLgGcwNYA1kBsYDbwG6gOCAcmA5cB44D2gIQgQvCAHQAHAAkAHOAQcAn4CPQEigJWATaAp8BYQC8gGIAMWgZCBkYDRgGpgNoAbcA3SB5IHlAPkAfuBAQCBkEEQQTAgwBCsCFw4BgAAiABwAHgAXABIAD8ANAA5wB3AEAgIOAhABEQCfgFQAL0AdIBHoCRQErAJiATKAm0BSACkwFdgLUAXQAxABiwDIQGTANGAaaA1MBrwDaAG2ANuAcfA50Dn4HkgeUA-IB9sD9gP3AgeBBECDAEGwIVjoJQAC4AKAAqABwAEAALoAZABqADwAIgATAAqwBcAF0AMQAbwA9AB-gEMARIAlgBNACjAGGAMoAaIA2QB3gD2gH2AfoA_4CKAIwAUEAq4BYgC5gF5AMUAbQA3ABxADqAIdAReAkQBMgCdgFDgKPgU0BTYCrAFigLYAXAAuQBdoC7wF5gL6AYaAx4BkgDJwGVQMsAy4BnIDVQGsANvAbqA4sByYDlwHjgPaAfWBAECFpAAmAAgANAA5wCxAI9ATaApMBeQDUwG2ANuAc_A8kDygHxAP2AgeBBgCDYEKyEB4ABYAFAAXABVAC4AGIAN4AegBHADvAH-ARQAlIBQQCrgFzAMUAbQA6kCmgKbAWKAtEBcAC5AGTgM5AaqA8cCFAELSUCEABAACwAKAAcAB4AEQAJgAVQAuABigEMARIAjgBRgDZAHeAPwAq4BigDqAIdAReAkQBR4CxQFsALzAZOAywBnIDWAG3gPaAgeSAHgAXAHcAQAAqACPQEigJWATaApMBiwDcgHlAP3AgiBBgpA3AAXABQAFQAOAAggBkAGgAPAAiABMACkAFUAMQAfoBDAESAKMAZQA0QBsgDvgH2AfoBFgCMAFBAKuAXMAvIBigDaAG4AQ6Ai8BIgCdgFDgKbAWKAtgBcAC5AF2gLzAX0Aw0BkgDJ4GWAZcAzmBrAGsgNvAbqA4IByYDxwHtAQhAhaUAQgAXABIAI4Ac4A7gCAAEiALEAa8A7YB_wEegJFATEAm0BSACnwFdgLoAXkAxYBkwDUwGvAPKAfFA_YD9wIGAQPAgmBBgCDYEKw.YAAAAAAAAAAA; OTAdditionalConsentString=1~; domain_selected=true; v_sid=15e655d8-1731770231; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzMxOTM1NzE1LCJzaWQiOiIxNWU2NTVkOC0xNzMxNzcwMjMxIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3MzE5NDI5MTUsInB1cnBvc2UiOiJhY2Nlc3MifQ.ttDB4WNnBrh6RQz5NSqdLKOtI04ki1c6ONFCc-IS3Nc3PwYLQSFYVKy0Ld-vVxRULU1BPQdIhrayfWsqyh8jpY7fLhXeQZh6jJPUyyoF47FC1pv2uCM1ZOFA-emTo5dy4O2j1Jo1TNsRdSXwDSaAOSD988zxdTVoJxQzj656zqbECoK8UIF-CJRkZeveqJkXbxIr0kPvkVw4pz3ZCcppOgCmdz4g80AdxfgVJXjYpz2gzpebWSWL7m2KuDpj49PJmab7hbvS2gqZI5PiauRxsjdGWazGTjTO4j6fGCkn4KquX8iXTIHDt_JebcZ24eO3Tnj0bsFtnPU1ZhAwB2O49Q; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzMxOTM1NzE1LCJzaWQiOiIxNWU2NTVkOC0xNzMxNzcwMjMxIiwic2NvcGUiOiJwdWJsaWMiLCJleHAiOjE3MzI1NDA1MTUsInB1cnBvc2UiOiJyZWZyZXNoIn0.j2qB5QpIPUcRdZlC4UMQV7VlonJ9VXCe5IzUaDSXdEec7kG3sQWbMIKd5UPMGmVYfjpPthKZrtyTVNiDASc_9ez5rpVmaIjzwnetXGxDLlscWBEXqLfoUGMcSIW_uvxhvcr0gh8krq03H0ortS1lKeal7kykfsg9dMT6xOY5W3w_A_DenTrSJTjUAaB5d5_5cY97iEwxBiTKyDX-kP9jtK2tZCa8AeorDA2unijrrqu_NQj3VKDCHVAiwZu-plMNC-IVK6Y2Qe7tsxYRbPNxpQtuEIaOsiH9oXKRY1T-E50wzUJa-1j9NMTAtT73TQglw4dN3DGXXnqwP5lN9Uz8xg; __cf_bm=EMyCNa4VSLipOIk0AAtTOi3UhtMg9HuKaCnVdqPlH9k-1731935716-1.0.1.1-n5KZ8d6wQ1yROKpX8l9Se7Cy2p1pj25MLNTzQriEkYyFSgvvbCzdCD1j.gck7_mmbzOyrfDtvaFoyCjeiRxhvxNaQ8Dis9Q_xTp2O614G.g; cf_clearance=.DcgWClHLeh8AC9kdus_.2SNwPP4zdZvKKV1ogbL0vc-1731935718-1.2.1.1-0f17_CGk.YWdmazeDZUB.vIIjm8TD8LCr1Jtu83NyN3RhmiEZzqA4g0Di4ByhkPbDC0W5d3dBABxXpEmIYCxp3kg7ArHSg66ir4hspT8CmAs3b0pjzRNMAxJwvXiurLDP5UdVMBJaI3Va4zoLkUFNFHZcqVKtihyB_yMsEGB0_lJ14ZThpmuJs3XuepkkucBQz5qXw41jhpNmXsp2cKcqtMa3LfSKnyiWjQopYkXnw6d06IsvPl6tsw.m8eDjbpM8cmZsNB4ysiAZuNlEoW8O9BeOJqKsZNm13YSFFDFtI1tAqJpq3nRj6QkViq2mjICGjoL0OlMR1yxVpWeqwlVhWc2H3T.oQ2C3xaHgWCLZTZShluJtApTg1xiV0DgGQxs; viewport_size=150; datadome=YZ6BN51sOT0m6wC_B21PpsUrxqBjcRC_KT~T6HgnmuMDL7XSN4_MOjIuari4T3GAxSdSsBq5OAAgCkHgkfIQ~BRj8TIlxStZtQmXIgByt1KLGknDxtFdh7aEYSeEUjZq; _vinted_fr_session=Nmd6ZEJ3WGpHMFNCdzZDTHhDdmF2Sy94SE5pQ1drUTZpdzM1djBKM3NIcDZKcXB0bi9ETEVZeGJDRkVjejJMNnhqcUgwNG5mVjNKeHhsZFRvNWFqSUw1UjlwYTc3L1VFN1BtYzRqclN1QmovbThvNGhxa0xnOGI2S0FCOTJ1bnpIWGpSdE1CUWpJLzNQYjVSL1RKNDk2Rk1YeTVrVXV1UDArWkd6OEpTZ094VlZIY0E3R3g0eGFqMkYzczcvZGpSZncxUWZnUC9JSmowSWY4OGo3b2ZSMnJoWmRKb1JvNTZ1Qys4NHZZUGtqbjhsVlJIODZGRlV6aERxRkhxNXprM3FwdVhFeWhKZWJvalMvVWJtaGlJbHZhelBoN0hZRFQwOTNSOUZUK2JmanNZaUhqQjlVakJjTUtRaGZORXRDemtyZVJyMGxTWVpUK1VXLzNieDUxSS9UTGhOdzFPZ0JpZURoWlQ3UGt6OUlvekhXbnlDUm4vUkVWbUZvSXRJdm1EU3QvM0g2eVU2aDRNOWhDZnc2OXJlUlpCemEvdU5CNVd2ODVTcTNyWFJNY3dLSUhOU012RDladTJpUkRmWkp3QWpPVEtEV3B6UVA3RzF1bHBXR29PQTF4UHV4YTI2YnkxRVQ4cDBCT0pzRVJxNlpwWEVmR2dLc0tZclZGRzZLd2JuK2NkcVg4OUtYTDBHYWRwaTlTYW9WZW0reElOWC9FTTBiZkh6TFdRWXJiYmNWVmxQRzYxbWh1MTZUVFlNdlUvZ0JrOUN2cWIrWGRmbnJMZjZsNExhejR3M0ZLN2V5TnZrWFlqR00vTFp5RWFnRkd0azBVS2Y0bitBbXZKMzhDWTJZeFVQMGpKQmJySlVpdTFXS0kvSVg1VkRRS2YzOFNMR3laTWhWa1N4R3BNZzJqNURVN3YxM3NlZ2k4Q0lpem52TG1KR1N3Zk1TaUpzZ1huSWt4dVBJb3lNaklqbjYxYkxOU0Mrb2NZOTFySFFHU1JIQjhWWkdrZzlGWnlOZmZpQ25CMjNPYVZOdjV1RERKUlBrZEFwYzlLNHNBQWs3TkVISkNRN3ZVNlVvcnVTaytMY1IrR2lOR1pRNU5nYm1oTVRiU3ZDYUxRRWFCNncxYjFhLzg5SVhWd3MzUW91VUpEREREU3dzVkoxVDhOUUxKSGk4YllKQ3hMQ3BqSWdIZ0F4OUJaSmRhZks5SXhIYnhIaGdWL3pmZXVzM1lmQytvMnBIVEFjYi9iZk93UHZkNnEybDEvRUdERUxqSUFDMDlPSmJWYnZDSUFaRm14UTRtMng1RkZIcmlCZVVsSGJSeE5lS1FkWTBqUXYyWnlqTk1BSTFNcDZwRzh2RVZ2RnFBNURDdmU1V2UrWEZlaGhTZG9SekVmTHkzMzJrU1JsK2ozV0g5Yk02NytPYWRseTlESW1uRnk1N2hHdWxMRDJ1bEh1SERVR1BXYUY3UmJYYlQ4TXRJY1RoZUFsazliNkNaK2gxWkM3M1RoVFJ1bWE4SzVHVFNjS1RkRlVWbkUvNE9rVys0cTcvR25tWG9qMEtaNDl4cHlpZFRJV3Z2eHA2SHhMRjZiTjJzM1hmRW1PejM1dUpQNzRrdnpmYXhvd3l6aXZ1ZTJTNUx2a2dTL0s5b2RsUit0UlNVRFpWcU11VU9FZE1hY3ZjRnNmWTM1U0tmNjV5Y1h5anFYYmhXQmtUVnJqdFZhRWsxRDVvWXo1N0k4eGM2SmtLdHNQQ0p0ZUMzZUlvQnl1OGFkbDg1ZkpOS0k4K0hGdlZ6ZmM5SEpwQ29IWFgvYnd3cllDeVNaZ2NaVytqTXpKdE9tcE1VeCs0UVZhNWpJUU8xMUFrdTVKWEkxWnBkTi9QZjZQaEo0RXNSWUpEV09Ca2swNUhHUmZLQlZ6VmN3MU1tbEg1VTdNaTFIMUtpKzd0bEFwQmJ6eTNzWVV3aTdJRU9yTjNleGh0K0VxYzYvbTY5TlprWm52UTU3WGNraDM5Znloa3RsRk9SUVluTDZQOWp5RXRSa2U5cXowWWc0N0VSaEx3amwrSmgwOGVKektremJlNS9IM2xjQStDd3l2Mm90cnlPL1hJTUE1SnRmU2VUN1ArU3EvMitKY3VnMXhRdlBWMEk2ZitabktDbXF3clpOUER4ajhWblk5TENXeTNYMHN2bXYydGNhMEtrT0s0eFBZNW9jQmIwaktVTCs2TzFQK2xkQi9LazAwQ0d4M3FheitlRXJwVlRJSTdOUmZMRkhBMVh4aTNQYnFVRTRvbndQZUNQTUdIaTlWNVMwMDBDb25aNDRnZUM0LS1HTGllZmc3eDh6YXFUTG9yVU1IRXZRPT0%3D--e062942496471eff996b29f8c7678eae2a75b3c0; _dd_s=rum=2&id=86221e0c-aa51-4d92-8c3b-122f8061e1a4&created=1731935719298&expire=1731936637059; OptanonConsent=isGpcEnabled=0&datestamp=Mon+Nov+18+2024+14%3A15%3A38+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=1647353b-2247-4041-9d0f-e706f133d04a&interactionCount=19&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CV2STACK42%3A0%2CC0015%3A0%2CC0005%3A0%2Cgad%3A0%2CM0001%3A0&geolocation=FR%3B&AwaitingReconsent=false&genVendors=V2%3A0%2CV1%3A0%2C; banners_ui_state=PENDING",
        "Referer": `https://www.vinted.fr/catalog?search_text=lego%20${id}&time=1731935719&page=1`,
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      
      "method": "GET"
    });

    //return res2;
    return res2?.items || [];
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
  //const VintedDeals = await fetchDeals2(extractedID);
  //console.log(VintedDeals);
  
  if (Array.isArray(VintedDeals)) {
    const deals = VintedDeals.map((deal) => ({
      id : extractedID,
      title: deal.title,
      price: deal.price ? `${deal.price.amount}` : "N/A",
      url : deal.url,
      date : deal.photo.high_resolution.timestamp,
    }));

    await page.close();
    return deals;
  } else {
    console.log("No data found for the URL.");
    await page.close();
    return [];
  }
};

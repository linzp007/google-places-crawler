


## Features

This Google Maps crawler will enable you to get more and faster data from Google Places than the official  [Google Places API](https://developers.google.com/places/web-service/search).

To understand how to configure the scraper and get ideas on how you can use the data you can extract,  [watch a short video tutorial](https://www.youtube.com/watch?v=J43AX9wu-NI)  on YouTube or follow our step-by-step guide on  [how to scrape Google Maps](https://blog.apify.com/step-by-step-guide-to-scraping-google-maps/).

Our unofficial Google Maps API enables you to extract all of the following data from Google Maps:

-   Title, subtitle, category, place ID, and URL
-   Address, location, plus code and exact coordinates
-   Phone and website if available
-   Menu and price if available
-   Temporarily or permanently closed status
-   Popular times - histogram & live occupancy
-   Average rating (`totalScore`), review count, and review distribution
-   List of images (optional)
-   List of detailed characteristics (`additionalInfo`, optional)
-   Opening hours (optional)
-   People also search (optional)

The scraper also supports the scraping of all detailed information about reviews:

-   Review text
-   Published date
-   Stars
-   Review ID & URL
-   Response from owner - text and published date

Personal data extraction about reviewers has to be **explicitly** enabled in input (see  [Personal data section](https://apify.com/drobnikj/crawler-google-places#personal-data)):

-   Reviewer name
-   Reviewer ID & URL
-   Reviewer number of reviews
-   Is Local Guide

The Google Maps Scraper also provides other very useful features:

-   Geolocation - enables scraping the whole country, state, county, city, or postal code (integration with Nomatim Maps API)
-   Language & translation settings
-   Reviews sorting
-   Proxy configuration
-   Browser & scraping configuration

## Advantages over Google Maps API

The official Google Places API (it's still called the old way) is an adequate option for many use cases, but this unofficial Google Maps API provides more cost-effective, comprehensive results, and also scrapes histograms for popular times, which aren't available in the official API. While you are no longer limited to a maximum number of requests per day with the Google Places API, there are still rate limits and quotas that apply. Our Google Maps API enforces no such rate limits or quotas.


## How much will it cost?
As a rule, getting results with Google Maps Scraper will not consume a lot of your platform credits. But this depends heavily on the complexity of your search. For more details about platform credits and usage, see the [Cost of usage tab](https://apify.com/drobnikj/crawler-google-places/cost-of-usage#features).

## Google Maps scraping tutorial

For a simple explanation of how to scrape Google Maps, follow a step-by-step [tutorial on our blog](https://blog.apify.com/step-by-step-guide-to-scraping-google-maps/) or see our short [YouTube video](https://www.youtube.com/watch?v=J43AX9wu-NI).

[![Apify - Google Maps](https://i.imgur.com/8FLt9W4.png)](https://www.youtube.com/watch?v=J43AX9wu-NI)


### Why scrape Google Maps?
-  **analyze reviews** for positive/negative sentiment, quality of service, and specific phrases.
- create a potential **customer base**.
-   search, monitor and **analyze the competitors'** offers.
-   find where to **buy a specific product** and choose the best option out of the pool of results.
-   **analyze geospatial data** for scientific or engineering work.
- find opportunities for **expanding your business** or organization and developing a working market strategy.

For more ideas on how to use the extracted data, check out our  [industries pages](https://apify.com/industries)  for concrete ways web scraping results are already being used across the projects and businesses of various scale and direction - in  [travel and logistics](https://apify.com/industries/travel-and-logistics), for instance.

## Input 

When running the Google Maps Scraper, you need to configure what you want to scrape and how it should be scraped. This input is provided either as a JSON file or in the editor on the Apify platform. Most input fields have reasonable default values.

### Input example

```json
{
  "searchStringsArray": ["pubs"],
  "city": "Prague"
}
```

For detailed descriptions and examples for all input fields, please visit the dedicated  [Input page](https://apify.com/drobnikj/crawler-google-places/input-schema).

## Output

The scraped data is stored in the dataset of each run. The data can be viewed or downloaded in many popular formats, such as *JSON, CSV, Excel, XML, RSS, and HTML*.

### Output example
The result for scraping a single Google Place looks like this (*shortened to only the first two pubs for viewing convenience*):

```json
{
  "title": "Fat Cat Beerhouse & Restaurant",
  "subTitle": null,
  "price": "$$",
  "menu": "fat-cat.cz",
  "categoryName": "Restaurant",
  "address": "Karlova 44, 110 00 Staré Město, Czechia",
  "locatedIn": null,
  "neighborhood": "Karlova 44",
  "street": "Karlova 44",
  "city": "Old Town",
  "postalCode": "110 00",
  "state": null,
  "countryCode": "CZ",
  "plusCode": "3CP9+CG Prague, Czechia",
  "website": "https://www.fat-cat.cz/",
  "phone": "+420 735 751 751",
  "temporarilyClosed": false,
  "permanentlyClosed": false,
  "totalScore": 4.4,
  "isAdvertisement": false,
  "rank": 47,
  "placeId": "ChIJxT1C1u6UC0cRjNBm7b6wDjM",
  "categories": [
    "Restaurant"
  ],
  "cid": "3679072279681486988",
  "url": "https://www.google.com/maps/place/Fat+Cat+Beerhouse+%26+Restaurant/@50.0860664,14.416575,17z/data=!3m1!4b1!4m5!3m4!1s0x470b94eed6423dc5:0x330eb0beed66d08c!8m2!3d50.0860664!4d14.4187637?hl=en",
  "searchPageUrl": "https://www.google.com/maps/search/takeout/@50.0852853,14.4123976,1225m/data=!3m1!1e3!4m4!2m3!5m1!15shas_takeout!6e5!5m1!1e4?hl=en",
  "searchString": null,
  "location": {
    "lat": 50.0860664,
    "lng": 14.4187637
  },
  "scrapedAt": "2022-01-20T16:28:59.701Z",
  "reviewsCount": 3609,
  "reviewsDistribution": {
    "oneStar": 94,
    "twoStar": 68,
    "threeStar": 315,
    "fourStar": 829,
    "fiveStar": 2303
  },
  "imageUrls": [
    "https://lh5.googleusercontent.com/p/AF1QipPkgSf8TR98sGzI2RnJKvRyzfoyYkTrRUugYWKj=w1920-h1080-k-no"
  ],
  "reviews": [],
  "orderBy": [
    {
      "name": "restu.cz",
      "url": "http://restu.cz/fat-cat-praha/"
    }
  ]
},
{
  "title": "At The Old Lady",
  "subTitle": null,
  "price": "$$",
  "menu": null,
  "categoryName": "Restaurant",
  "address": "9, Michalská 441, 110 00 Hlavní město, Czechia",
  "locatedIn": null,
  "neighborhood": "9, Michalská 441",
  "street": "9, Michalská 441",
  "city": "Hlavní město",
  "postalCode": "110 00",
  "state": null,
  "countryCode": "CZ",
  "plusCode": "3CM9+XX Prague, Czechia",
  "website": "http://www.hotelustarepani.cz/",
  "phone": "+420 589 127 964",
  "temporarilyClosed": false,
  "permanentlyClosed": false,
  "totalScore": 4.5,
  "isAdvertisement": false,
  "rank": 64,
  "placeId": "ChIJORAjle6UC0cR697RocpZFnU",
  "categories": [
    "Restaurant"
  ],
  "cid": "8437029678758354667",
  "url": "https://www.google.com/maps/place/At+The+Old+Lady/@50.0849313,14.4176865,17z/data=!3m1!4b1!4m5!3m4!1s0x470b94ee95231039:0x751659caa1d1deeb!8m2!3d50.0849313!4d14.4198755?hl=en",
  "searchPageUrl": "https://www.google.com/maps/search/takeout/@50.0852853,14.4123976,1225m/data=!3m1!1e3!4m4!2m3!5m1!15shas_takeout!6e5!5m1!1e4?hl=en",
  "searchString": null,
  "location": {
    "lat": 50.0849313,
    "lng": 14.4198755
  },
  "scrapedAt": "2022-01-20T16:29:08.907Z",
  "reviewsCount": 39,
  "reviewsDistribution": {
    "oneStar": 3,
    "twoStar": 0,
    "threeStar": 1,
    "fourStar": 5,
    "fiveStar": 30
  },
  "imageUrls": [
    "https://lh5.googleusercontent.com/proxy/DqAYJYgsu9aQCdbKvnrdwONTW60qn_Dyhz2re-pmtj7xf2MN8bfU2qVc70OUyqmaiUZ54aBqXuhNeX8LO4F0RCiagkT2M-kjhCLa-EP07Nb9PR5LtFdO-hJ_JLk8PXsKEMMM9chiedjk2_achCni-V4e8fGj060=w1920-h1080-k-no"
  ],
  "reviews": [],
  "orderBy": []
}
```

### Adjusting output format

The Apify platform allows you to choose from many dataset formats, but also to restructure the output itself.

#### One review per row

Normally, each result item contains data about a single place. Each item is displayed as one row in tabulated formats. There is a lot of data about each place, so the tabulated formats get very messy and hard to analyze. Fortunately, there is a solution.

For example, if you need to analyze reviews, you can configure the download to only contain the data you need and adjust the row/column format. Here's how to get a list of reviews with a place title one review per row: copy the download link in the format you need, paste it to a different tab, and add  `&unwind=reviews&fields=reviews,title`  to the end of the link URL, and then press Enter to download it.  `unwind=reviews`  means that each review will be on its own row.  `fields=reviews,title`  means that only reviews and title will be downloaded, skipping the other data. Otherwise, the output would be very big, but it's also no problem if you don't use  `fields`  at all.

The whole download link for, e.g. CSV would look like this (with dataset ID):[https://api.apify.com/v2/datasets/DATASET_ID/items?clean=true&format=csv&attachment=true&unwind=reviews&fields=reviews,title](https://api.apify.com/v2/datasets/dataset_id/items?clean=true&format=csv&attachment=true&unwind=reviews&fields=reviews,title)

## Usage on Apify platform and locally

If you want to run the actor on the  [Apify platform](https://apify.com/), you may need to use some proxy IP addresses. You can use your free Apify Proxy trial or you can subscribe to one of  [Apify's subscription plans](https://apify.com/pricing).

### Running locally or on a different platform

You can easily run this scraper locally or on your favorite platform. It can run as a simple Node.js process or inside a Docker container.

## How the search works

It works exactly as though you were searching Google Maps on your computer. It opens  [https://www.google.com/maps/](https://www.google.com/maps/)  and relocates to the specified location, then writes the search to the input. Then it presses the next page button until it reaches the final page or  `maxCrawledPlaces`. It enqueues all the places as separate pages and then scrapes them. If you are unsure about anything, just try this process in your browser - the scraper does exactly the same thing.

### Using country, state, county, city, and postal code parameters

You can use any combination of the geolocation parameters:  `country`,  `state`,  `county`,  `city`  &  `postalCode`. The scraper uses  [nominatim maps](https://nominatim.org/)  to find a location polygon and then splits that into multiple searches that cover the whole area to ensure maximum scraped places.

### Automatic zooming

The scraper automatically zooms the map to ensure maximum results are extracted. Higher  `zoom`  ensures more (less known) places are scraped but takes longer to traverse by the scraper. Logically, the smaller the area is, the higher zoom should be used. Currently, the default  `zoom`  values are:
- no geo or  `country`  or  `state`  -> 12 
 - `county`  -> 14  
 - `city`  -> 17  
-  `postalCode`  -> 18

If you need even more results or faster run, you can override these values with the  `zoom`  input parameter.  `zoom`  can be any number between 1 (whole globe) and 21 (few houses).

## Custom Geolocation

The easiest way to use our Google Maps Scraper is to provide  `country`,  `state`,  `county`,  `city`  or  `postalCode`  input parameters. But in some rare cases, your location might not be found or you may want to customize it. In that case, you can use  `customGeolocation`  for the creation of start URLs. As example, see the  `geojson`  field in  [Nominatim Api](https://nominatim.openstreetmap.org/)  (see  [here for the example of Cambridge in Great Britain](https://nominatim.openstreetmap.org/search?country=united%20kingdom&state=&city=cambridge&postalcode=&format=json&polygon_geojson=1&limit=1&polygon_threshold=0.005))

There are several types of geolocation geometry that you can use. All follow official  [Geo Json RFC](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.2).

### Polygon

The most common type is polygon which is a set of points that define the location.  **The first and last coordinate must be equal (to close the polygon)!!!**  `customGeolocation`  should have this format:

```json
{
    "type": "Polygon",
    "coordinates": [
        [
            [
                // Must be the same as last one
                0.0686389, // Longitude
                52.2161086 // Latitude
            ],
            [
                0.1046861,
                52.1906436
            ],
            [
                0.0981038,
                52.1805451
            ],
            [
                0.1078243,
                52.16831
            ],
            [
                // Must be the same as first one
                0.0686389, 
                52.2161086
            ]
        // ...
        ]
    ]
}

```

### MultiPolygon

Multi polygon can combine more polygons that are not continuous together.

```json
{
    "type": "MultiPolygon",
    "coordinates": [
        [ // first polygon
            [
                [
                    12.0905752, // Longitude
                    50.2524063  // Latitude
                ],
                [
                    12.1269337,
                    50.2324336
                ],
                // ...
            ]
        ],
        [
            // second polygon
            // ...
        ]
    ]
}

```

## Personal data

Reviews can contain personal data such as a name, profile image, and even a review ID that could be used to track down the reviewer. Personal data is protected by GDPR in the European Union and by other regulations around the world. You should not scrape personal data unless you have a legitimate reason to do so. If you're unsure whether your reason is legitimate, consult your lawyers. This scraper allows you to granularly select which personal data fields you want to extract from reviews and which not. You can read the basics of ethical web scraping in our blogpost on the  [legality of web scraping](https://blog.apify.com/is-web-scraping-legal/).


## Changelog

This scraper is under active development. We are always implementing new features and fixing bugs. If you would like to see a new feature, please submit an issue on GitHub. Check  [CHANGELOG.md](https://github.com/drobnikj/crawler-google-places/blob/master/CHANGELOG.md)  for a list of recent updates.

## Contributions

We're always pleased to see issues or pull requests created by the community.

Special thanks to:  [mattiashtd](https://github.com/mattiashtd)  [zzbazza](https://github.com/zzbazza)

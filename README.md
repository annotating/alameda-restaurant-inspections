# Alameda Restaurant Inspections

Inspect restaurant inspection reports from the Alameda County [dataset](https://data.acgov.org/Health/Alameda-County-Restaurants-Inspections/3d5b-2rnz).  
By default, displays recent records. Users can also search for specific restaurants.

## Dataset

* Restaurant Name
* Location
* Inspection History
  * Date
  * Grade 
  * Violation Description

Information not available to query, but would be nice to include:
* Permits
* Closures

## Project

To run project locally, create a .env file, and supply your own [Google Maps](https://developers.google.com/maps/documentation/javascript/) and [data.acgov.org](https://data.acgov.org/profile/app_tokens) (optional) API keys. 


```
.env
ACGOV_TOKEN = your_key
GOOGLE_MAPS_API_KEY = your_key
```

Then `npm start` as usual.

## References
[Socrata Open Data API](https://dev.socrata.com/foundry/data.acgov.org/y2kh-zbwg)  
[Alameda County Restaurant Inspections - Official Website](https://www.acgov.org/aceh/food/restaurant_inspection.htm)
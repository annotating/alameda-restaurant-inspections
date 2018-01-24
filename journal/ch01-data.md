# Data

Set up basic API access to restaurant inspection dataset.  
https://dev.socrata.com/foundry/data.acgov.org/y2kh-zbwg

Pretty straightforward, and documentation on website was clear.

# SoQL 

Reference : https://dev.socrata.com/docs/queries/

Example query:
https://data.acgov.org/resource/y2kh-zbwg.json?$where=LOWER(facility_name)%20like%20LOWER(%27%25cold%20stone%25%27)
Gets record {name, grade, date, and location} starting from beginning of current month to today. 

Based on the reference, it didn't seem like I could select distinct facility names, so that was handled by the backend.






# Public Health and the City

This is a COVID-19 themed routing application that uses near-real time data from the city of Melbourne's pedestrian counting system to calculate 'least crowded routes' between to points. You can find more information about the project [here](https://github.com/chrstnbwnkl/gima_m_6/blob/master/poster/Decrowd_Poster.pdf). If you're interested in running this app locally, you can download git [here](https://git-scm.com/) and clone this repository. As of now, this is a locally hosted application, so some preparation steps are necessary to make it work. 

## Install PostgreSQL and create database
First, make sure you have a current version of PostgreSQL as well as PostGIS and pgRouting installed, and on PATH. Next, download the backup file to create the database [here](https://drive.google.com/file/d/1TYK-0L5ZhrpHMyt9AekAUe3fgNVpayU7/view?usp=sharing) (GitHub is allergic to large files). Copy it in your repository, CD into the repository folder and run
```psql -U <username> -p <password> -f M6.sql```

## Prepare R:
Download R, make sure it's on PATH, and install the needed dependencies by running the following R script:
```
Rscript install_dependencies.R
```
Next, set up the database connection correctly in the Krige_update script (set host, database, user and password).

## Get your own API key
The Melbourne pedestrian count API is available through a Socrata API. To access it, you need to generate your own API key. You can do that for free, and there's no real limit for the number of calls (just don't query the whole historical data set every 17 seconds). Save the key somewhere, you'll need it later.

## Prepare node application
Make sure node.js and node package manager (npm) are installed. In the main repository folder, run
```
npm install
```
Then, inside the repository folder, create a file called ".env" and populate it like this (this is where you'll need the API key again):
```
host=localhost
port=5432
username=postgres
password=<yourpassword>
database=M6
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/M6
apikey=<apikey>
```

Then you should be good to go! In the main repository folder, run
```
node app
```
and the application should be running at localhost:5000!

Things to do:

- [x] Add connection to Postgres server
- [x] Insert API data into Postgres
- [x] Add pedestrian count data periodically to Postgres
- [x] Show description
- [x] Show shortest and least crowded routes
- [x] Hide API Key
- [x] Add "about" page
- [ ] Show statistics comparing the two routes
- [ ] Customize map appearance
- [ ] Group road segments for description
- [ ] Allow for address input w/ Overpass API geocoding
- [ ] Try anisotropic kriging

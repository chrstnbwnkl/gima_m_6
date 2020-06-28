# Public Health and the City

This is a COVID-19 themed routing application that uses near-real time data from the city of Melbourne's pedestrian counting system to calculate 'least crowded routes' between to points. You can find more information about the project [here](https://github.com/chrstnbwnkl/gima_m_6/blob/master/poster/Decrowd_Poster.pdf) As of now, this is a locally hosted application, so some preparation steps are necessary. 

## Install PostgreSQL with PostGIS and pgRouting
First, make sure you have a current version of PostgreSQL as well as PostGIS and pgRouting installed, and on PATH. Create a database called 'M6' and create PostGIS and pgRouting extensions:
```
CREATE EXTENSION PostGIS;
CREATE EXTENSION pgRouting;
```
Next, you'll need a routable graph, which can be created from the included osm file. For this, we need osm2po, which produces a Postgres database from the osm road data (download [here](http://osm2po.de/releases/osm2po-5.2.43.zip)). Put the osm.pbf file into the osm2po folder and replace the CONFIG file with the one from the repository (Make sure Java is installed and on PATH).

```
java -jar osm2po-core-5.2.43-signed.jar prefix=mb_ex melbourne.osm_01.pbf
```

Make sure the osm2po version in the command corresponds to the name of the file in your folder. Follow the instructions following after you hit enter. You end up with a folder inside the osm2po folder that is called "mb_ex". In that folder, you find a text file called "mb_ex_2po". Open it, scroll down and somewhere at the end you should find two command line templates for adding the graph to postgres that should look like this:
```
psql -U [username] -d [dbname] -q -f "path/to/some.sql"
psql -U [username] -d [dbname] -q -f "path/to/some_vertex.sql"
```
Copy the line from the text file into a command line prompt, replace username and dbname with your username and the dbname "M6".

## Prepare Postgres for automatic table updates
First, we need the ped_count table to have certain columns and a primary key. In the repository folder, run:
```
psql -U postgres -d database -f ped_count.sql
```
## Prepare R:
Download R, make sure it's on PATH, and install the needed dependencies by running the following R script:
```
Rscript install_dependencies.R
```
Next, set up the database connection correctly in the Krige_update script (set host, database, user and password).

## Prepare node application
Make sure node.js and node package manager (npm) are installed. In the main repository folder, run
```
npm install
```
Then, inside the repository folder, create a file called ".env" and populate it like this:
```
host=localhost
port=5432
username=postgres
password=yourpassword
database=M6
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/M6
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
- [x] Show directions
- [x] Show shortest and least crowded routes
- [ ] Show statistics comparing the two routes
- [x] Add "about" page
- [ ] Customize map appearance

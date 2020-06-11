# Module 6: Our Smart Routing App!

If you now want to run the server, you need some additional adjustments in Postgres and Python. First, create a table in pgAdmin with the following statement:
```SQL
CREATE TABLE public.ped_count
(
    date date,
    "time" time without time zone,
    sensor_id numeric(2,0),
    direction_1 numeric(6,0),
    direction_2 numeric(6,0),
    total_of_directions numeric(6,0),
    date_time timestamp without time zone
)
```
Second, you'll need Anaconda to run Python from. In the Anaconda prompt, create a new environment for the module 6 project with the following statements:
```
conda create --name m6
conda install osmnx
```
Lastly, open the Anaconda navigator, activate the environment you just created and launch VS Code from there. Then, in VS Code, you might need to change the Python interpreter, which can be done by pressing CTRL + SHIFT + P and then type Python Interpreter. Select the Anaconda environment you just created and you're good to go!

## Add pgRouting to Postgres
Next, you'll need to add routing capabilities to our postgres database. So first of all, we need a graph to route on. Geofrabrik produces downloadable osm data for this purpose for the entire Australian continent [here](https://download.geofabrik.de/australia-oceania/australia-latest.osm.pbf). Also, we need osm2po, which is a software package in Java that produces a postgres database from the osm road data. Download the software [here](http://osm2po.de/releases/osm2po-5.2.43.zip) and unpack it anywhere you want. Put the osm.pbf file you downloaded from Geofabrik into the osm2po folder. To run osm2po, we need to make sure Java runtime is installed, so open a command line prompt, type java and hit enter. If it doesn't recognize the command, you need to download a Java runtime environment [here](https://www.java.com/en/download/). Try the java command again after installing to see if it works. 

Next, we want to change the config of osm2po so that it includes postprocessing for pgRouting. Open the osm2po.config file, scroll down to the postprocessing section. There you'll see a bunch of commands starting with #postp.X.class. Remove the # character for the very first option "postp.0.class" and the third option "postp.1.class". Save and close the file. Now we can run osm2po from the command line. Start a command prompt in the osm2po folder and type the following command: 
```
java -jar osm2po-core-5.2.43-signed.jar prefix=at australia-latest.osm.pbf
```
Make sure the osm2po version in the command corresponds to the name of the file in your folder. Follow the instructions following after you hit enter. You end up with a folder inside the osm2po folder that is called "at". In that folder, you find a text file called "at_2po". Open it, scroll down and somewhere at the end you should find a command line template for adding the graph to postgres that should look like this:
```
psql -U [username] -d [dbname] -q -f "C:\Users\Chris\Documents\GIMA\Module 6\osm2po\at\at_2po_vertex.sql"
```
Copy the line from the text file into a command line prompt, replace username and dbname with your username and the dbname "M6". When this is done, we need to make the graph routable in pgRouting. Go to pgAdmin, enter into our M6 database and open the query editor. Run the following SQL statement:
```
CREATE EXTENSION PostGIS;
CREATE EXTENSION pgRouting;
```
Next, we need to build a topology from the osm data. The osm data should be in a table called "at_2po_4pgr". So the statement should look like this:
```
SELECT  pgr_createTopology('at_2po_4pgr', 0.00001, 'id', 'source', 'target', true, true);
```
This should be enough preparation, so we can finally test a routing algorithm:
```
SELECT * 
  FROM pgr_dijkstra(
    'SELECT id, source, target, cost FROM at_2po_4pgr',
    109224, 115544
  ) 
```
This query should return a table with a couple of hundred rows. That's our route!


Things to do:

- [x] Add connection to Postgres server
- [x] Insert API data into Postgres
- [ ] Add pedestrian count data periodically to Postgres
- [x] Integrate OSMNx 
- [x] Integrate Python
- [ ] Build network from Melbourne open data pedestrian network for NetworkX usage
- [ ] Expand website functionality

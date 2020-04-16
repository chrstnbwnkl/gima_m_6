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
Things to do:

- [x] Add connection to Postgres server
- [x] Insert API data into Postgres
- [ ] Add pedestrian count data periodically to Postgres
- [x] Integrate OSMNx 
- [x] Integrate Python
- [ ] Build network from Melbourne open data pedestrian network for NetworkX usage
- [ ] Expand website functionality

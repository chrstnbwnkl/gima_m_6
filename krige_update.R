require("RPostgreSQL")
require('rpostgis')
require('automap')
require('sp')
library(DBI)
library(rgdal)
library(raster)
library(rgeos)

# Establish Postgres connection
conn <- RPostgreSQL::dbConnect("PostgreSQL", host = "localhost",
                               dbname = "M6", user = "postgres", password = "wasser")

# Load pixel dump for pre-processing
shape <- readOGR(dsn = "./GIMA/Module 6/software-testing", layer = "pixel_dump")
shape@data$ID <- as.numeric(shape@data$ID)

# Fetch pedestrian count data
res <- dbSendQuery(conn, "SELECT total_of_directions AS z, ST_X(geom) AS lon, ST_Y(geom) AS lat, sensor_id AS id FROM ped_count WHERE total_of_directions IS NOT NULL ORDER BY sensor_id")
data <- dbFetch(res)

# Compute grid for prediction
grid_lat <- seq(-37.8328849, -37.7930220, 0.001)
grid_lon <- seq(144.9341885, 144.9877509, 0.001)
grd <- expand.grid(lon = grid_lon, lat = grid_lat)
df <- data.frame(matrix(NA, nrow = 2160, ncol = 1))
grd_spdf <- SpatialPointsDataFrame(coords = grd, data=df, proj4string = CRS("+init=epsg:4326"))

# Pedestrian count data to spatial object (includes transformation to xy for kriging, then back to lat/lon for web mapping)
xy <- data[,c(2,3)]
spdf <- SpatialPointsDataFrame(coords = xy, data = data,
                               proj4string = CRS("+init=epsg:4326"))
count_data_transform <- spTransform(spdf, crs("+init=epsg:3857"))
grid_3857 <- spTransform(grd_spdf, crs("+init=epsg:3857"))

# Kriging w/ autofitting
krigingResult <- autoKrige(formula=z~1, input_data=count_data_transform, new_data = grid_3857)
resultSP_4326 <- spTransform(krigingResult$krige_output, crs("+init=epsg:4326"))

# Store predicted value in polygons
shape.data <- over(shape, resultSP_4326[,"var1.pred"])
shape$ped_count <- shape.data$var1.pred

# Insert results back into Postgres
pgInsert(conn, c("public", "krigeGrid"), shape)

# Update cost layer
dbSendQuery(conn, 'UPDATE mb_ex_2po_4pgr SET new_cost = final_intersect.ped_count_total/cast(final_intersect.counts as decimal)/st_length(geom_way)
FROM (
	SELECT network.id, SUM(ped_count) as ped_count_total, COUNT(ped_count) as counts FROM mb_ex_2po_4pgr AS network
INNER JOIN krige_intersect ON krige_intersect.edge_id = network.id
INNER JOIN public."krigeGrid" ON public."krigeGrid"."ID" = krige_intersect.grid_id
	GROUP BY network.id
) as final_intersect;')
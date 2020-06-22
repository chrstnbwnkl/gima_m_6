require("RPostgres")
require('automap')
require('sp')
library(DBI)
library(rgdal)
library(raster)
library(rgeos)

# Connect to the default postgres database
con <- dbConnect(RPostgres::Postgres(),dbname = 'M6', 
                 host = 'localhost',
                 port = 5432, # or any other port specified by your DBA
                 user = 'postgres',
                 password = 'wasser')

res <- dbSendQuery(con, "SELECT total_of_directions AS z, ST_X(geom) AS lon, ST_Y(geom) AS lat, sensor_id AS id FROM ped_count WHERE total_of_directions IS NOT NULL ORDER BY sensor_id")
data <- dbFetch(res)

grid_lat <- seq(-37.8328849, -37.7930220, 0.001)
grid_lon <- seq(144.9341885, 144.9877509, 0.001)

grd <- expand.grid(lon = grid_lon, lat = grid_lat)
df <- data.frame(matrix(NA, nrow = 2160, ncol = 1))
grd_spdf <- SpatialPointsDataFrame(coords = grd, data=df, proj4string = CRS("+init=epsg:4326"))

#grd_sf  <-  st_as_sf(grd, coords = c("lon", "lat"), 
#                    crs = 4326, agr = "constant")

#grd_sp <- as_Spatial(grd_sf)
xy <- data[,c(2,3)]
spdf <- SpatialPointsDataFrame(coords = xy, data = data,
                               proj4string = CRS("+init=epsg:4326"))
count_data_transform <- spTransform(spdf, crs("+init=epsg:3857"))
grid_3857 <- spTransform(grd_spdf, crs("+init=epsg:3857"))
krigingResult <- autoKrige(formula=z~1, input_data=count_data_transform, new_data = grid_3857)
resultSP_4326 <- spTransform(krigingResult$krige_output, crs("+init=epsg:4326"))
resultRaster <- rasterFromXYZ(resultSP_4326, crs=crs("+init=epsg:4326"))
writeRaster(resultRaster, filename="rraster.asc", format="ascii", overwrite=TRUE)

filename <- "rraster.asc"
cmds <- paste("raster2pgsql -d -s 4326 -I -F -t 50x50",filename,"rraster |psql -U postgres -d M6 -h localhost -p 5432", sep=" ")
shell(cmds)
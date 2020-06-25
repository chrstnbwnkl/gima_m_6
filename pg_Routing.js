const {query} = require('./config/database');
const {config_pg} = require('./config/pg_config');
query_returns= [];

function routeQuery(start, end) {
    const query_new = `
    SELECT *, st_length(ST_Transform(geom_way,32755)) as seg_length, st_transform(geom_way, ${config_pg.output_srid}) as geom, st_asgeojson(st_transform(geom_way, ${config_pg.output_srid})) geojson, st_astext(st_transform(geom_way, ${config_pg.output_srid})) wkt FROM pgr_dijkstra(
        'SELECT id, source, target, new_cost as cost FROM ${config_pg.table}', 
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(geom_vertex, st_setsrid(st_makepoint(${start}), ${config_pg.input_srid})) LIMIT 1),
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(geom_vertex, st_setsrid(st_makepoint(${end}), ${config_pg.input_srid})) LIMIT 1),
        false) as dj, ${config_pg.table} as ln where dj.edge=ln."id";`;
    
    const query_short = `
    SELECT *, st_transform(geom_way, ${config_pg.output_srid}) as geom, st_asgeojson(st_transform(geom_way, ${config_pg.output_srid})) geojson, st_astext(st_transform(geom_way, ${config_pg.output_srid})) wkt FROM pgr_dijkstra(
        'SELECT id, source, target, cost FROM ${config_pg.table}', 
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(geom_vertex, st_setsrid(st_makepoint(${start}), ${config_pg.input_srid})) LIMIT 1),
        (SELECT id FROM ${config_pg.vertices_table} ORDER BY st_distance(geom_vertex, st_setsrid(st_makepoint(${end}), ${config_pg.input_srid})) LIMIT 1),
        false) as dj, ${config_pg.table} as ln where dj.edge=ln."id";`;
    const queries = [query_new, query_short]
        return queries;
}

function queryAsPromise(arg) {
    return new Promise((resolve, reject) => {
      query(arg, (err, res) => {
        if (err) {
          console.error(err);
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  }

  function route(start, end) {
    const queries = routeQuery(start, end);
  
    return Promise.all(
      queries.map(query => queryAsPromise(query))
    )
    .then(
//         results => results.reduce(
//       (acc, item) => [...acc,...item.rows],
//       []
//     )
//     )
//     .then(coords => {
//       return { coords };
//     });
//   }
        results => {
            console.log(results[0].rows.length - results[1].rows.length);
            return {
                route_new: results[0].rows,
                route_quick: results[1].rows
            }
        });
    }


module.exports = {
    route,
};
const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const app = express();
app.use(express.json());

let initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001");
      console.log("Database connected Successfully");
    });
  } catch (e) {
    console.log(e);
  }
};

initializeDbAndServer();

let convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

let convertDbObject = (Object) => {
  return {
    directorId: Object.director_id,
    directorName: Object.director_name,
  };
};
let getDirector = (Object) => {
  return {
    movieName: Object.movie_name,
  };
};

let getMovie = (Object) => {
  return {
    movieId: Object.movie_id,
    directorId: Object.director_id,
    movieName: Object.movie_name,
    leadActor: Object.lead_actor,
  };
};

//Returns a list of all movie names in the movie table

app.get("/movies/", async (req, res) => {
  const moviesQuery = `select * from movie`;
  let movies = await db.all(moviesQuery);
  res.send(movies.map((each) => convertDbObjectToResponseObject(each)));
});

//Creates a new movie in the movie table. movie_id is auto-incremented

app.post("/movies/", async (req, res) => {
  const moviesDetails = req.body;
  const { movieId, directorId, movieName, leadActor } = moviesDetails;
  const movieQuery = `insert into movie(movie_id,director_id,movie_name,lead_actor)
   values(?,?,?,?)`;
  await db.run(movieQuery, [movieId, directorId, movieName, leadActor]);
  res.send("Movie Successfully Added");
});

//Returns a movie based on the movie ID

app.get("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;

  const movieQuery = `SELECT * FROM movie WHERE movie_id = ?`;
  const movie = await db.get(movieQuery, movieId);
  res.send(getMovie(movie));
});

//Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;
  const movieDetails = req.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `update movie set director_id=?,movie_name=?,lead_actor=? where movie_id=?`;
  await db.run(updateQuery, [directorId, movieName, leadActor, movieId]);
  res.send("Movie Details Updated");
});

//Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (req, res) => {
  const { movieId } = req.params;
  const deleteQuery = `delete from movie where movie_id=?`;
  await db.run(deleteQuery, movieId);
  res.send("Movie Removed");
});

//Returns a list of all directors in the director table

app.get("/directors/", async (req, res) => {
  const getQuery = `select * from director`;
  let directors = await db.all(getQuery);
  res.send(directors.map((each) => convertDbObject(each)));
});

//Returns a list of all movie names directed by a specific director

app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const getQuery = `select movie_name from movie where director_id=?`;
  let director = await db.all(getQuery, directorId);
  res.send(director.map((each) => getDirector(each)));
});

module.exports = app;

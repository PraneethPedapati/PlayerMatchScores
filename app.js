let express = require("express");
let path = require("path");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");

let app = express();
app.use(express.json());

module.exports = app;

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Running Server Successfully..!!!");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  let getPlayersQuery = `
        SELECT player_id AS playerId, player_name AS playerName
        FROM player_details
    `;
  let players = await db.all(getPlayersQuery);
  response.send(players);
});

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getPlayerQuery = `
        SELECT player_id AS playerId, player_name AS playerName
        FROM player_details
        WHERE player_id = ${playerId}
    `;
  let player = await db.get(getPlayerQuery);
  response.send(player);
});

app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let playerDetails = request.body;
  let { playerName } = playerDetails;
  let updatePlayerQuery = `
        UPDATE player_details
        SET player_name='${playerName}'
        WHERE player_id=${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  let getMatchQuery = `
        SELECT match_id AS matchId, match, year
        FROM match_details
        WHERE match_id = ${matchId}
    `;
  let match = await db.get(getMatchQuery);
  response.send(match);
});

app.get("/players/:playerId/matches", async (request, response) => {
  let { playerId } = request.params;
  let getMatchQuery = `
        SELECT match_details.match_id AS matchId, match_details.match AS match, match_details.year As year
        FROM player_match_score
        INNER JOIN match_details ON player_match_details.player_id = match_details.player_id
        WHERE match_details.player_id = ${playerId};
    `;
  let matches = await db.get(getMatchQuery);
  response.send(matches);
});

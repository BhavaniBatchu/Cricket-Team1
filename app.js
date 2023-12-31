const express = require('express');
const path = require('path');

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname,"cricketTeam.db");

let db = null;

const initializeDbAndServer = async() => {
try {
    db = await open({
        filename:dbPath,
        driver:sqlite3.Database,
    });
    app.listen(3000,() => {
        console.log("Server Running at http://localhost:3000/");
    });
} catch(error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
}
};
initializeDbAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
    return {
        playerId:dbObject.player_id,
        playerName:dbObject.player_name,
        jerseyNumber: dbObject.jersey_Number,
        role:dbObject.role,
    };
};

//Returns a player based on player Id//
app.get("/players/", async(request,response) => {
    const {playerId} = request.params;
    const getPlayerQuery = `
    SELECT
    *
    FROM 
    cricket_team `;
    const player = await db.get(getPlayerQuery);
    response.send(convertDbObjectToResponseObject(player));
});

//ADD players API//
app.post("/players/", async( request, response)=> {
    const playerDetails = request.body;
    const {playerName,jerseyNumber,role} = playerDetails;
    const addPlayerQuery = `
    INSERT INTO
    cricket_team (player_name, jersey_number, role)
    VALUES('${playerName}', '${jerseyNumber}', '${role}');` ;
const dbResponse = await db.run(addPlayerQuery);
response.send("Player Added to Team");
});

//Returns a player based on player Id//
app.get("/players/:playerId", async(request,response) => {
    const {playerId} = request.params;
    const getPlayerQuery = `
    SELECT
    *
    FROM 
    cricket_team 
    WHERE 
    player_id = ${playerId};` ;
    const player = await db.get(getPlayerQuery);
    response.send(convertDbObjectToResponseObject(player));
});

//UPDATE Players API//
app.put("/players/:playerId/", async (request,response) => {
    const { playerId } = request.params;
    const playerDetails = request.body;
    const { playerName, jerseyNumber,role } = playerDetails;
    const updatePlayerQuery = `
    UPDATE 
    cricket_team 
    SET 
    player_Name = '${playerName}',
    jersey_Number = '${jerseyNumber}',
    role = '${role}',
    WHERE 
    player_id = ${playerId};` ;
    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
});

//DELETE Players API//
app.delete("/players/:playerId/",async(request,response) => {
    const {playerId} = request.params;
    const deletePlayerQuery = `
    DELETE FROM
    cricket_team 
    WHERE 
    player_id = ${playerId};` ;
    await db.run(deletePlayerQuery);
    response.send("Player Removed");
});

module.exports = app;
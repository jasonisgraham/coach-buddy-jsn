var CoachBuddy = {
	getCanvas : function() {
		return document.getElementById("soccer-field");
	},
	init : function(callback) {		
		initDatabase();
		fetch("SELECT * FROM PLAYER");
		fetch("SELECT * FROM PLAYER");
		fetch("SELECT * FROM PLAYER");
		drawField();
		drawTeamList();
	}
};

function showTeamDetails() {
	$.mobile.changePage("#team-details", "slide", false, true);
}

function showConfig() {
	$.mobile.changePage("#config", "flip", false, true);
}
function showAddPlayer() {
	$.mobile.changePage("#add-player", "flip", false, true);
}
function showEditPlayer() {
	$.mobile.changePage("#edit-player", "flip", false, true);
}
function showViewPlayer() {
	$.mobile.changePage("#view-player", "flip", false, true);
}

function drawField() {
	var myCanvas = CoachBuddy.getCanvas();
	var ctx = myCanvas.getContext("2d");
	var img = new Image();
	img.onload = function() {
		ctx.drawImage(img, 0, 0);
	}
	img.src = 'img/soccer_field.jpg';
}

CoachBuddy.Player = {
	name : null,
	age : null,
	favoritePosition : null,
	jerseyNumber : null,
	contactNumber : null,
	makeUrl : function(player) {
		return "<a href=\"player/"
				+ player["name"].toLowerCase().replace(" ", "_") + "\">"
				+ player["name"] + "</a>";
	},
	add : function() {
		initDatabase();
		saveRecord("PLAYER", [ 'name', 'age', 'favoritePosition',
				'jerseyNumber', 'contactNumber' ]);
	},
	remove : function() {
	},
	update : function() {
	},
	getIcon : function() {
	}
};

CoachBuddy.Game = {
	hometeam : null,
	awayteam : null,
	hometeamScore : null,
	awayteamScore : null,
	startTime : null,
	endTime : null,
	add : function() {
		initDatabase();
	},
	remove : function() {
	},
	update : function() {
	},
	getIcon : function() {
	}
};

function getRoster() {
	fetch("SELECT * FROM PLAYER");	

	return queryResults;
}

function getRosterListHtml() {
	console.log("Entering getRoseterListHtml");
	var players = getRoster();

	var rosterList = "<ul>";
	$(players).each(function(i, v) {
		rosterList += "<li>" + CoachBuddy.Player.makeUrl(v) + "</li>";
	});
	rosterList += "</ul>";
	console.log("Leaving getRoseterListHtml");
	return rosterList;
}

function drawTeamList() {
	$("#player-list").html(getRosterListHtml());
}

CoachBuddy.Formation = {
	numberPlayers : null,
	name : null
}

function getObjectFromFieldList(fieldList) {
	var kv = {};
	$(fieldList).each(function() {
		kv[this] = $("#" + this).val();
	});
	return kv;
}

var connection;
var queryResults;
function insertRecord(tx) {
	kv = $.isArray(kv) ? getObjectFromFieldList(kv) : kv;
	var keys = Object.keys(kv);
	var sqlStr = 'INSERT INTO ' + tableName + ' (' + keys.join(',')
			+ ') VALUES ( ' + keys.map(function() {
				return "?";
			}).join(",") + ')';
	console.log(sqlStr);
	tx.executeSql(sqlStr, keys.map(function(k) {
		return kv[k];
	}), onSqlSuccess, onSqlError);
	console.log("Leaving insertRecord");
};

var tableName;
var kv;
function initDatabase() {
	console.log("Opening database");
	console.log("Checking theDB");
	if (!connection) {
		connection = window.openDatabase("coachBuddyDb", "1.0", "Coach Buddy",
				3 * 1024 * 1024);
	}
	if (connection) {
		console.log(connection);
		console.log("Creating table");
		connection.transaction(playerCreateTable, this.onTxError,
				this.onTxSuccess);
		connection.transaction(teamCreateTable, this.onTxError,
				this.onTxSuccess);
		connection.transaction(gameCreateTable, this.onTxError,
				this.onTxSuccess);
		connection.transaction(formationCreateTable, this.onTxError,
				this.onTxSuccess);
		console.log("Finished creating table");
	} else {
		console.log("theDB object has not been created");
	}
}
function onTxError(tx, err) {
	console.log("Entering onTxError");
	var msgText;
	// Did we get an error object (we should have)?
	if (err) {
		// Tell the user what happened
		msgText = "TX: " + err.message + " (" + err.code + ")";
	} else {
		if (tx.message) {
			msgText = tx.message;
		} else {
			msgText = "TX: Unkown error";
		}
	}
	console.error(msgText);
	alert(msgText);
	console.log("Leaving onTxError");
}
function onTxSuccess() {
	console.log("TX: success");
}
function executeSql(sqlStr) {
	queryResults = null;
	connection.transaction(function(tx) {
		tx.executeSql(sqlStr, [], onQuerySuccess, onQueryFailure);
	}, onTxError, onTxSuccess);
}
function fetch(sqlStr) {
	console.log("Entering fetch for " + sqlStr);
	executeSql(sqlStr);
	console.log("Leaving fetch for " + sqlStr);
	return queryResults;
}
function onSqlSuccess(tx, res) {
	console.log("SQL: success");
	if (res) {
		console.log(res);
	}
}
function onSqlError(tx, err) {
	console.log("Entering onSqlError");
	var msgText;
	if (err) {
		msgText = "SQL: " + err.message + " (" + err.code + ")";
	} else {
		msgText = "SQL: Unknown error";
	}
	console.error(msgText);
	alert(msgText);
	console.log("Leaving onSqlError");
}
function onQuerySuccess(tx, results) {
	console.log("Entering onQuerySuccess");
	var len = results.rows.length;
	queryResults = [];
	if (len > 0) {
		for ( var i = 0; i < len; i++) {
			queryResults.push(results.rows.item(i));
		}
	}
	console.log("Leaving onQuerySuccess");
}
function onQueryFailure(tx, err) {
	console.log("Entering onQueryFailure");
	var msgText;
	if (err) {
		msgText = "Query: " + err;
	} else {
		msgText = "Query: Unknown error";
	}
	console.error(msgText);
	alert(msgText);
	console.log("Leaving onQueryFailure");
}
function saveRecord(tableName, kv) {
	console.log("Entering saveRecord");
	this.tableName = tableName;
	this.kv = kv;
	connection.transaction(insertRecord, this.onTxError, this.onTxSuccess);
	console.log("Leaving saveRecord");
}
function playerCreateTable(tx) {
	console.log("Entering createTable");
	var sqlStr = 'CREATE TABLE IF NOT EXISTS PLAYER (name TEXT, age INT, favoritePosition TEXT, jerseyNumber INT, contactNumber INT)';
	console.log(sqlStr);
	tx.executeSql(sqlStr, [], this.onSqlSuccess, this.onSqlError);
	console.log("Leaving createTable");
}

function gameCreateTable(tx) {
	console.log("Entering createTable");
	var sqlStr = 'CREATE TABLE IF NOT EXISTS GAME (hometeam TEXT, awayteam TEXT, hometeamScore INT, awayteamScore INT, startTime DATE, endTime DATE)';
	console.log(sqlStr);
	tx.executeSql(sqlStr, [], this.onSqlSuccess, this.onSqlError);
	console.log("Leaving createTable");
}
function teamCreateTable(tx) {
	console.log("Entering createTable");
	var sqlStr = 'CREATE TABLE IF NOT EXISTS TEAM (name TEXT, hometown TEXT)';
	console.log(sqlStr);
	tx.executeSql(sqlStr, [], this.onSqlSuccess, this.onSqlError);
	console.log("Leaving createTable");
}
function formationCreateTable(tx) {
	console.log("Entering createTable");
	var sqlStr = 'CREATE TABLE IF NOT EXISTS FORMATION (name TEXT, numberPlayers INT)';
	console.log(sqlStr);
	tx.executeSql(sqlStr, [], this.onSqlSuccess, this.onSqlError);
	console.log("Leaving createTable");
}

$(document).ready(function() {
	CoachBuddy.init(function() { return queryResults.length > 0; });
});
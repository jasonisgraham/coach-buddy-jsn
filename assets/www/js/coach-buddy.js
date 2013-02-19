var CoachBuddy = {
	getCanvas : function() {
		return document.getElementById("soccer-field");
	},
	init : function() {
		CoachBuddy.Database.init();
		CoachBuddy.Field.drawField();
		CoachBuddy.Team.drawTeamList();		
	}
};

CoachBuddy.Page = {
	showTeamDetails : function() {
		$.mobile.changePage("#team-details", "slide", false, true);
	},
	showConfig : function() {
		$.mobile.changePage("#config", "flip", false, true);
	},
	showAddPlayer : function() {
		$.mobile.changePage("#add-player", "flip", false, true);
	},
	showEditPlayer : function() {
		$.mobile.changePage("#edit-player", "flip", false, true);
	},
	showViewPlayer : function() {
		$.mobile.changePage("#view-player", "flip", false, true);
	}
};

CoachBuddy.Field = {
	drawField : function() {
		var myCanvas = CoachBuddy.getCanvas();
		var ctx = myCanvas.getContext("2d");
		var img = new Image();
		img.onload = function() {
			ctx.drawImage(img, 0, 0);
		}
		img.src = 'img/soccer_field.jpg';
	},
};

CoachBuddy.Player = {
	name : null,
	age : null,
	favoritePosition : null,
	jerseyNumber : null,
	contactNumber : null,
	makeUrl : function(player) {
		return "<a href=\"player/" + player["name"].toLowerCase().replace(" ", "_")
				+ "\">" + player["name"] + "</a>";
	},
	add : function() {
		CoachBuddy.Database.init();
		CoachBuddy.Database.saveRecord("PLAYER", [ 'name', 'age',
				'favoritePosition', 'jerseyNumber', 'contactNumber' ]);
		$.mobile.changePage("#main", "flip", false, false);
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
		CoachBuddy.Database.init();
	},
	remove : function() {
	},
	update : function() {
	},
	getIcon : function() {
	}
};

CoachBuddy.Team = {
	drawTeamList : function() {
		console.log("entering getRoster");
		connection.transaction(
				function(tx) {
					tx.executeSql("SELECT * FROM PLAYER", [], CoachBuddy.Team.onQuerySuccess,
							CoachBuddy.Database.onQueryFailure);
				}, CoachBuddy.Database.onTxError, CoachBuddy.Database.onTxSuccess);
		console.log("leaving getRoster");
	},
		
	onQuerySuccess: function(tx, results) {
		console.log("Entering CoachBuddy.Team.onQuerySuccess");
		var len = results.rows.length;
		var players = [];
		if (len > 0) {
			for (var i = 0; i < len; i++) {
				players.push(results.rows.item(i));				
			}
		}
		
		var rosterList = "<ul>";
		$(players).each(function(i, v) {
			rosterList += "<li>" + CoachBuddy.Player.makeUrl(v) + "</li>";
		});
		rosterList += "</ul>";
		$("#player-list").html(rosterList);		
					
		console.log("Leaving CoachBuddy.Team.onQuerySuccess");
	},
	
	drawTeam : function() {
	}
};

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
	var kv = $.isArray(CoachBuddy.Database.kv) ? getObjectFromFieldList(CoachBuddy.Database.kv)
			: CoachBuddy.Database.kv;
	var tableName = CoachBuddy.Database.tableName;
	var keys = Object.keys(kv);
	var sqlStr = 'INSERT INTO ' + tableName + ' (' + keys.join(',')
			+ ') VALUES ( ' + keys.map(function() {
				return "?";
			}).join(",") + ')';
	console.log(sqlStr);
	tx.executeSql(sqlStr, keys.map(function(k) {
		return kv[k];
	}), CoachBuddy.Database.onSqlSuccess, CoachBuddy.Database.onSqlError);	
	console.log("Leaving insertRecord");
}

CoachBuddy.Database = {	
	tableName : null,
	kv : null,	
	init : function() {
		console.log("Opening database");
		console.log("Checking theDB");
		if (!connection) {
			connection = window.openDatabase("coachBuddyDb", "1.0",
					"Coach Buddy", 3 * 1024 * 1024);
		}
		if (connection) {
			console.log(connection);
			console.log("Creating table");
			connection.transaction(CoachBuddy.Database.player.createTable,
					this.onTxError, this.onTxSuccess);
			connection.transaction(CoachBuddy.Database.team.createTable,
					this.onTxError, this.onTxSuccess);
			connection.transaction(CoachBuddy.Database.game.createTable,
					this.onTxError, this.onTxSuccess);
			connection.transaction(CoachBuddy.Database.formation.createTable,
					this.onTxError, this.onTxSuccess);
			console.log("Finished creating table");
		} else {
			console.log("theDB object has not been created");
		}
	},
	onTxError : function(tx, err) {
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
	},
	onTxSuccess : function() {
		console.log("TX: success");		
	},
	executeSql : function(sqlStr) {
		queryResults = null;
		connection.transaction(
				function(tx) {
					tx.executeSql(sqlStr, [], CoachBuddy.Database.onQuerySuccess,
							CoachBuddy.Database.onQueryFailure);
				}, CoachBuddy.Database.onTxError, CoachBuddy.Database.onTxSuccess);
	},
	fetch: function(sqlStr) {		
		console.log("Entering fetch for " + sqlStr);
		CoachBuddy.Database.executeSql(sqlStr);
		console.log("Leaving fetch for " + sqlStr);
		return queryResults;				
	},
	onSqlSuccess : function(tx, res) {
		console.log("SQL: success");
		if (res) {
			console.log(res);
		}
	},
	onSqlError : function(tx, err) {
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
	},
	onQuerySuccess : function(tx, results) {
		console.log("Entering onQuerySuccess");			
		console.log("Leaving onQuerySuccess");
	},
	onQueryFailure : function(tx, err) {
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
	},
	saveRecord : function(tableName, kv) {
		console.log("Entering saveRecord");
		this.tableName = tableName;
		this.kv = kv;
		connection.transaction(insertRecord, this.onTxError, this.onTxSuccess);
		console.log("Leaving saveRecord");
	},
	player : {
		createTable : function(tx) {
			console.log("Entering createTable");
			var sqlStr = 'CREATE TABLE IF NOT EXISTS PLAYER (name TEXT, age INT, favoritePosition TEXT, jerseyNumber INT, contactNumber INT)';
			console.log(sqlStr);
			tx.executeSql(sqlStr, [], this.onSqlSuccess, this.onSqlError);
			console.log("Leaving createTable");
		},

		saveRecord : function() {
		}
	},
	game : {
		createTable : function(tx) {
			console.log("Entering createTable");
			var sqlStr = 'CREATE TABLE IF NOT EXISTS GAME (hometeam TEXT, awayteam TEXT, hometeamScore INT, awayteamScore INT, startTime DATE, endTime DATE)';
			console.log(sqlStr);
			tx.executeSql(sqlStr, [], this.onSqlSuccess, this.onSqlError);
			console.log("Leaving createTable");
		},
	},
	team : {
		createTable : function(tx) {
			console.log("Entering createTable");
			var sqlStr = 'CREATE TABLE IF NOT EXISTS TEAM (name TEXT, hometown TEXT)';
			console.log(sqlStr);
			tx.executeSql(sqlStr, [], this.onSqlSuccess, this.onSqlError);
			console.log("Leaving createTable");
		},
	},
	formation : {
		createTable : function(tx) {
			console.log("Entering createTable");
			var sqlStr = 'CREATE TABLE IF NOT EXISTS FORMATION (name TEXT, numberPlayers INT)';
			console.log(sqlStr);
			tx.executeSql(sqlStr, [], this.onSqlSuccess, this.onSqlError);
			console.log("Leaving createTable");
		},
	}
};

CoachBuddy.Camera = {
	takePhoto: function() {
		navigator.camera.getPicture(onCameraSuccess, onCameraError);
	},
	onCameraSuccess: function(imageURL) {
		navigator.notification.alert("onCameraSuccess: " + imageURL);
	},
	onCameraError: function(e) {
		navigator.notification.alert("onCameraError: " + e);
	}
};

$(document).ready(function() {
	CoachBuddy.init();
});
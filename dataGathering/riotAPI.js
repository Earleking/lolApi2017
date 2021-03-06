
function riot(key) {
    this.request = require('request');
    this.key = key;
    this.host = "https://na1.api.riotgames.com"
    //patchTime is the ms epoch time of the most recent patch. This just gets only current patch data
    this.patchTime = 1512709200000;
    this.keyString = "?api_key=" + this.key;
}
//callback should accept 1 arg, an int for the id
riot.prototype.nameToSummonerID = function(name, callback) {
    var uri = this.host + "/lol/summoner/v3/summoners/by-name/" + name + this.keyString;
    this.request(uri, function(err, res, body) {
        if(err) {
            throw err;
        }
        var json = JSON.parse(body);
        callback(json.id);
    });
}
riot.prototype.nameToProfile = function(name, callback) {
    var uri = this.host + "/lol/summoner/v3/summoners/by-name/" + name + this.keyString;
    this.request(uri, function(err, res, body) {
        if(err) {
            throw err;
        }
        var json = JSON.parse(body);
        callback(json);
    });
}
//callback should accept 1 arg, an int for the id
riot.prototype.nameToAccountID = function(name, callback) {
    var uri = this.host + "/lol/summoner/v3/summoners/by-name/" + name + this.keyString;
    this.request(uri, function(err, res, body) {
        if(err) {
            throw err;
        }
        var json = JSON.parse(body);
        callback(json.accountId);
    });
}

//requires accountID
//returns an array of the games. Just the basic details, get .gameId and query that for more detail
riot.prototype.getGameList = function(accountID, callback) {
    var uri = this.host + "/lol/match/v3/matchlists/by-account/" + accountID + "?queue=420&beginTime=" + this.patchTime + "&api_key=" + this.key;
    this.request(uri, function(err, res, body) {
        if(err) throw err;
        var json = JSON.parse(body);
        if(json.status_code != undefined) {
            throw json.status_code + ": " + json.message;
        }
        var games = new Array(json.endIndex);
        for(var i = 0; i < games.length; i ++) {
            games[i] = json.matches[i];
        }
        callback(games);
    });
}

riot.prototype.getGame = function(gameID, callback) {
    var uri = this.host + "/lol/match/v3/matches/" + gameID + this.keyString;
    this.request(uri, function(err, res, body) {
        var json = JSON.parse(body);
        if(json.status_code) {
            throw json.status_code + ": " + json.message;
        }
        callback(json);
    });
}

riot.prototype.getRankBySummonerID = function(summID, callback) {
    var uri = this.host + "/lol/league/v3/positions/by-summoner/" + summID + this.keyString;
    this.request(uri, function(err, res, body) {
        var json = JSON.parse(body);
        if(json.status_code) {
            throw json.status_code + ": " + json.message;
        }
        for(var i in json) {
            if(json[i].queueType == "RANKED_SOLO_5x5"){
                callback(json[i].tier);
            }
        }
        
    });
}

riot.prototype.getChampData = function(callback) {
    uri = "https://na1.api.riotgames.com/lol/static-data/v3/champions?locale=en_US&tags=info&tags=tags&dataById=false&api_key=" + this.key;
    this.request(uri, function(err, res, body) {
        var json = JSON.parse(body);
        var champions = json.data;
        var championArr = [];
        var championsArr = [];
        //console.log(json);
        for(var i in json.data) {
            championArr.push(champions[i].id);
            championArr.push(champions[i].name);
            championArr.push(champions[i].tags[0]);
            championArr.push(champions[i].tags[1]);            
            championArr.push(champions[i].info.difficulty);
            championArr.push(champions[i].info.attack);
            championArr.push(champions[i].info.defense);
            championArr.push(champions[i].info.magic);
            championsArr.push(championArr);
            championArr = [];
        }
        //console.log(championsArr);
        callback(championsArr);
    });
}

module.exports = riot;
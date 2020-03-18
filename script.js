var myCredentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "us-east-1:3c57bd44-6449-4d55-a4ae-2c7621c181e0"
});

var myConfig = new AWS.Config({
    credentials: myCredentials,
    region: "us-east-1"
});
AWS.config.update({ region: 'us-east-1' });
AWS.config.credentials = myCredentials;

var width = document.documentElement.clientWidth;
var testVar = 0;

var modal = document.getElementById("modal");
var voteConfirmName = document.getElementById("vote-confirm-name");
var closeBtn = document.getElementsByClassName("close")[0];
var confirmBtn = document.getElementsByClassName("confirm")[0];
var cancelBtn = document.getElementsByClassName("cancel")[0];
var modalText = document.getElementById("modal-text");

var voteTarget;
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

var voteCastedBool = false;

var voteResults = document.getElementById("vote-results");

function openModal(person) {
    console.log("openModal()");
    voteCastedBool = getCookie();

    if (voteCastedBool == "") {
        console.log("voteCastedBool is undefined");
        voteCastedBool = false;
    }
    console.log("voteCastedBool");
    console.log(voteCastedBool);

    if (voteCastedBool == false) {
        console.log("user has not yet voted");
        modal.style.display = "block";
        voteConfirmName.innerHTML = person;
        voteTarget = person;
    } else {
        console.log("use has already voted");
        voteSuccess();
    }
}

closeBtn.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function() {
    if (this.event.target == modal) {
        modal.style.display = "none";
    }
}

cancelBtn.onclick = function() {
    modal.style.display = "none";
}

confirmBtn.onclick = function() {
    var params = {
        TableName: "VoteResults",
        Key: {
            "Name": {
                "S": voteTarget
            }
        }
    };

    dynamodb.getItem(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            var oldVotesString = JSON.stringify(data["Item"]["Votes"]);
            console.log(oldVotesString);

            votesInt = parseInt(oldVotesString.replace(/\D/g, ""));

            votesInt++;

            votesString = votesInt.toString(10);
            console.log(votesString);

            var upDateParams = {
                TableName: 'VoteResults',
                Key: {
                    "Name": {
                        "S": voteTarget
                    }
                },
                UpdateExpression: 'set Votes = :n',
                ExpressionAttributeValues: {
                    ":n": { "N": votesString }
                }
            }

            dynamodb.updateItem(upDateParams, function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    voteSuccess();
                }
            });
        }
    });
}


function voteSuccess() {
    console.log("voteSuccess()");
    var params = {
        "RequestItems": {
            'VoteResults': {
                Keys: [{
                        "Name": {
                            S: "Alex George"
                        },
                    },
                    {
                        "Name": {
                            S: "Luke Linne"
                        },
                    },
                    {
                        "Name": {
                            S: "Connor Cai"
                        },

                    },
                    {
                        "Name": {
                            S: "Caleb Dean"
                        },

                    },
                    {
                        "Name": {
                            S: "Rachel Kocher"
                        },

                    },
                ]
            }
        }
    }

    var votes = [];
    dynamodb.batchGetItem(params, function(err, data) {
        var alexVotes = document.getElementById("alexVoteResult");
        var lukeVotes = document.getElementById("lukeVoteResult");
        var connorVotes = document.getElementById("connorVoteResult");
        var calebVotes = document.getElementById("calebVoteResult");
        var rachelVotes = document.getElementById("rachelVoteResult");

        if (err) {
            console.log(err, err.stack);
        } else {
            console.log("Get Item Success");
            responseString = JSON.stringify(data["Responses"]["VoteResults"]);
            console.log(responseString);

            console.log("ResponseString: " + responseString);
            responseArray = JSON.parse(responseString);

            for (var i = 0; i < responseArray.length; i++) {
                var nameString = JSON.stringify(responseArray[i]["Name"]["S"]).replace(/\"/g, "");
                var votesString = JSON.stringify(responseArray[i]["Votes"]["N"]).replace(/\"/g, "");
                console.log(nameString);
                console.log(votesString);

                switch (nameString) {
                    case "Luke Linne":
                        console.log("Luke");
                        lukeVotes.innerHTML = votesString;
                        break;
                    case "Connor Cai":
                        console.log("Connor");
                        connorVotes.innerHTML = votesString;
                        break;
                    case "Caleb Dean":
                        console.log("Caleb");
                        calebVotes.innerHTML = votestring;
                        console.log("change");
                        break;
                    case "Alex George":
                        console.log("Alex");
                        alexVotes.innerHTML = votesString;
                        break;
                    case "Rachel Kocher":
                        console.log("Rachel");
                        rachelVotes.innerHTML = votesString;
                        break;s
                }
                console.log("continue");
            }
        }
    })
    console.log("test5");
    voteCastedConfirm();
    console.log("test6");
    createCookie();
    console.log("testfinal");

}

function voteCastedConfirm() {
    console.log("voteCastedConfirm()");
    modal.style.display = "block";
    modalText.innerHTML = "Vote Already Casted!";
    cancelBtn.style.display = "none";
    confirmBtn.style.display = "none";

    voteResults.style.display = "block";

    setTimeout(function() {
        modal.style.display = "none";
    }, 1000);

}

var cKey = "cookieKey=";

function createCookie() {
    console.log("createCookie");
    document.cookie = "cookieKey=true";
}

function getCookie() {
    console.log("getCookie()");
    var decodedCookie = decodeURIComponent(document.cookie);
    console.log(decodedCookie);

    var cookieVal = decodedCookie.split(';');
    for (var i = 0; i < cookieVal.length; i++) {
        var c = cookieVal[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(cKey) == 0) {
            return c.substring(cKey.length, c.length);
        }
    }
    return "";
}

function changeTitlePic() {

    console.log(width);
    if (width > 700) {
        var picArray = ["farewell-horiz-2.jpg", "showpic1-horiz.JPG", "farewell-horiz-1.jpg", "5k-everyone-2.JPG", 
        "showpic2-horiz.JPG"];
        var picSRC = document.getElementById("desktop-title-pic").getAttribute("src");
    } else {
        var picArray = ["show-alex-pose-vert.jpg", "show-caleb-drumming-vert.JPG"];
        var picSRC = document.getElementById("mobile-title-pic").getAttribute("src");

    }

    console.log(picSRC);

    var newPicSRC = "";

    //flip throught the array as a slideshow

    for (var i = 0; i < picArray.length; i++) {

        if (picSRC === picArray[i]) {
            if (i + 1 === picArray.length) {
                newPicSRC = picArray[0];
            } else {
                newPicSRC = picArray[i + 1];
            }
        }
    }

    if (width > 700) {
        //if there was an error in the for loop - set the src to default
    
        if (newPicSRC === "") {
            newPicSRC = document.getElementById("desktop-title-pic").src;
        }

        console.log("newPicSRC: " + newPicSRC);
        document.getElementById("desktop-title-pic").src = newPicSRC;
    } else {
        //if there was an error in the for loop - set the src to default

        if (newPicSRC === "") {
            newPicSRC = document.getElementById("mobile-title-pic").src;
        }

        console.log("newPicSRC: " + newPicSRC);
        document.getElementById("mobile-title-pic").src = newPicSRC;
    }


}
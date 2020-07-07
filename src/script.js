import Amplify, { Auth } from "aws-amplify";
//import { API, graphqlOperation } from "aws-amplify";
//import * as mutations from "./graphql/mutations";
//import * as queries from './graphql/queries';

const amplifyConfig = {
    'aws_appsync_graphqlEndpoint': 'https://74enmikpsnapdkqvswkwazhvvi.appsync-api.us-east-1.amazonaws.com/graphql',
    'aws_appsync_region': 'us-east-1',
    'aws_appsync_authenticationType': 'API_KEY',
    'aws_appsync_apiKey': 'da2-4gnvoc5mxrbgvbwb4u3pbqt3e4',
    
}

//Amplify.configure(amplifyConfig);

var myCredentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "us-east-1:3c57bd44-6449-4d55-a4ae-2c7621c181e0"
});

var myConfig = new AWS.Config({
    credentials: myCredentials,
    region: "us-east-1"
});
AWS.config.update({ region: 'us-east-1' });
AWS.config.credentials = myCredentials;

/* new cognito setup */

// AWS.config.region = 'us-east-1';
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: "us-east-1:5efd8689-9ffa-49be-bc8e-6d460669f696"
// })

//https://thealexgeorgeexperience.auth.us-east-1.amazoncognito.com/login?client_id=4adb9pbbfed1d1safhsrjs7h38&response_type=code&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://thealexgeorgeexperience.com

var width = document.documentElement.clientWidth; //size of the screen
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

//selection box that opens when someone tries to vote
function openModal(person) {
    // // test
    // console.log("test");
    // const getVote = await API.graphql(graphqlOperation(queries.getVote, {"Name": "Connor Cai"}));
    // console.log(getVote);

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
        console.log("user has already voted");
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
            console.log("Data: ");
            console.log(data["Responses"]["VoteResults"]);
            var response = data["Responses"]['VoteResults'];
            var nameString = "";
            var votesString = "";
            console.log("length: " + response.length); 

            for (var i = 0; i < response.length; i++) {
                console.log("i: " + i);
                nameString = response[i].Name.S;
                votesString = response[i].Votes.N;
                console.log("nameString: " + nameString);
                console.log("votesString: " + votesString);

                switch (nameString) {
                    case "Luke Linne":
                        console.log("Luke");
                        lukeVotes.innerHTML = votesString;
                        break;
                    case "Connor Cai":
                        console.log("Luke");
                        connorVotes.innerHTML = votesString;
                        break;
                    case "Caleb Dean":
                        console.log("calreb");
                        calebVotes.innerHTML = votesString;
                        break;
                    case "Alex George":
                        console.log("aelx");
                        alexVotes.innerHTML = votesString;
                        break;
                    case "Rachel Kocher":
                        console.log("Rqachel");
                        rachelVotes.innerHTML = votesString;
                        break;
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

//when someone tries to confirm a vote
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

    var newPicSRC = ""; //path for the new image
    var picSRC = ""; //path for the old image
    var picArray = []; //array of possible images, changes based on screen size

    console.log(width);
    if (width > 700) {
        picArray = ["farewell-horiz-2.jpg", "showpic1-horiz.JPG", "farewell-horiz-1.jpg", "5k-everyone-2.JPG", 
        "showpic2-horiz.JPG"];
        picSRC = document.getElementById("desktop-title-pic").getAttribute("src");
    } else {
        picArray = ["show-alex-pose-vert.jpg", "show-caleb-drumming-vert.JPG"];
        picSRC = document.getElementById("mobile-title-pic").getAttribute("src");
    }

    //put in folder path
    for (var i = 0; i < picArray.length; i++) {
        picArray[i] = "../images/" + picArray[i];
    }

    
    console.log(picSRC);

    //flip throught the array as a slideshow and set newPicSRC
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
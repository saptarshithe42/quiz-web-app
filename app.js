// requiring the necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const https = require("https"); //native

// creating the express app
const app = express();

// necessary configurations
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/static-files"));
app.use(bodyParser.urlencoded({ extended: true }));


// Quiz game functions

var playerScore = 0;
var questions = [];


// mock api call

let url = "https://the-trivia-api.com/api/questions?";
url = url + "limit=" + 5 + "&" + "difficulty=" + "easy";


//API call
https.get(url, async function (response) {

    var mockData = '';
    response.on("data", function (data) {
        mockData += data;
    });
    var mockquiz;
    response.on("end", async function () {
        mockquiz = await JSON.parse(mockData);
    });
});

console.log("Mock completed");



// home route
app.get("/", function (req, res) {
    playerScore = 0;
    res.render("index");
});


// handle post request from home route


var numOfQuestions = 5;
var difficultyLevel = "easy";
var playerName = "Player";
var quizData = "";
app.post("/", function (req, res) {

    playerName = req.body.playerName;
    numOfQuestions = Number(req.body.numOfQuestions) + 1;
    difficultyLevel = req.body.difficultyLevel;

    console.log(req.body);

    getData(numOfQuestions, difficultyLevel);

    res.redirect("/quiz/1");

});




function getData(numOfQuestions, difficultyLevel) {
    // preparing URL for API call
    let url = "https://the-trivia-api.com/api/questions?";
    url = url + "limit=" + numOfQuestions + "&" + "difficulty=" + difficultyLevel;

    console.log(url);


    //API call
    https.get(url, function (response) {


        //getting the data
        var tempData = '';
        response.on("data", function (data) {
            tempData += data;
        });

        /*
        directly doing JSON.parse(data) was giving error - SyntaxError: Unexpected end of JSON input
        That's because it was sending data in chunks (*perhaps.. saw from stackoverflow*)
        so, first storing in a separate variable, then at the "end" (data stream over), we are parsing it
        */

        response.on("end", async function () {
            quizData = await JSON.parse(tempData);
        });


    });
}



var currentQuizData;
var currentQuesNum;
app.get("/quiz/:quesNum", function (req, res) {

    currentQuesNum = Number(req.params.quesNum);
    // let currQuesNum = req.params.quesNum;
    if (currentQuesNum == 1) {
        const quizObject = {

            currentQuesNum: currentQuesNum
        };

        res.render("quiz1", quizObject);
        currentQuesNum += 1;

        correctAnswerArray = [];
        givenAnswerArray = [];
        answerStatus = [];
    }

    else if (currentQuesNum <= numOfQuestions) {


        console.log("quizData : " + currentQuesNum + " : ");
        console.log(quizData[currentQuesNum - 1]);
        currentQuizData = quizData[currentQuesNum - 1];

        let answers = [];
        answers.push(currentQuizData.correctAnswer);
        for (let i = 1; i <= 3; i++) {
            answers.push(currentQuizData.incorrectAnswers[i - 1]);
        }

        shuffleArray(answers);

        const quizObject = {

            currentQuizData: currentQuizData,
            currentQuesNum: currentQuesNum,
            answers: answers,
            playerScore : playerScore
        };

        res.render("quiz", quizObject);
        currentQuesNum += 1;
    }

    else if(currentQuesNum >= numOfQuestions)
    {
        var resultObject = {
            playerName : playerName, 
            playerScore : playerScore,
            correctAnswerArray : correctAnswerArray,
            givenAnswerArray : givenAnswerArray,
            answerStatus : answerStatus
        }

        console.log(correctAnswerArray);
        console.log(givenAnswerArray);

        res.render("result", resultObject);
    }

});

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {

        // Generate random number
        var j = Math.floor(Math.random() * (i + 1));

        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

var givenAnswerArray = [];
var correctAnswerArray = [];
var answerStatus = [];

app.post("/quiz/:quesNum", function (req, res) {

    let currQuesNum = req.params.quesNum;

    

    if (currQuesNum == 1) {
        res.redirect("/quiz/" + currentQuesNum);
    }

    else {
        let givenAnswer = req.body.givenAnswer;

        console.log("Given answer : " + givenAnswer);
        console.log("Correct answer : " + currentQuizData.correctAnswer);

        givenAnswerArray.push(givenAnswer);
        correctAnswerArray.push(currentQuizData.correctAnswer);
        if(givenAnswer === currentQuizData.correctAnswer)
        {
            answerStatus.push("✅");
        }
        else
        {
            answerStatus.push("❌");
        }

        if (givenAnswer == currentQuizData.correctAnswer) {
            console.log("Correct");
            playerScore++;
        }
        else {
            console.log("Incorrect");
        }

        res.redirect("/quiz/" + currentQuesNum);
    }


});






// starting the server
app.listen(3000, function () {
    console.log("Server successfully started");
});

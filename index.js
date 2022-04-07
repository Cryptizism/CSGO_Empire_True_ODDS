// This code was written in like 15 mins or so, so expect it to be messy, but it works so deal with it IG.

// CHANGE THE BELOW 3 VARIABLES TO YOUR FIT

// Be kind to empire's api :D
var maxLoop = 100; // 100 would be 296647 worth of data (296647 rolls, the amount that would happen in about half a year take a bit)
var callDelays = 1000; // A delay for each API call so you don't bum fuck the api, you can make this 0 if you want to but that's very mean :(
var latestSeed = 2643; // Go to https://csgoempire.com/fairness, click on the roullete tab and click rolls on the latest entry, copy the seed number from the URL

const axios = require('axios');

var currentSeed = latestSeed;

var TCount = 0;
var CTCount = 0;
var DiceCount = 0;

var previousRoll;

var trains = [];
var currentTrain = {
    "side": "",
    "count": 0,
}

var highestTrainCount = 0;
var highestTrain = {};

var loopCount = 0;

async function fetchingLoop(){
    return new Promise((resolve)=>{
        axios.get(`https://csgoempire.com/api/v2/metadata/roulette/history?seed=${currentSeed}`)
            .then(function (response) {
                let rolls = response.data.rolls;
                rolls.forEach(i => {
                    if(i.coin == 't'){
                        TCount++;
                    } else if(i.coin == 'ct'){
                        CTCount++;
                    } else if(i.coin == "bonus"){
                        DiceCount++;
                    }
                    if(i.coin == previousRoll  || i.coin == "bonus"){
                        currentTrain.side = previousRoll;
                        currentTrain.count++;
                    } else {
                        if(currentTrain.count > 0){

                            trains.push(currentTrain);
                            currentTrain = {
                                "side": "",
                                "count": 0,
                            }
                        }
                    }
                    if(i.coin != "bonus"){
                        previousRoll = i.coin;
                    }
                });
                resolve(true);
            })
            .catch(function (error) {
                console.log(error);
                resolve(false);
            });
        });
}

async function startLoop(){
    if(loopCount == maxLoop){ return; }
    let result = await fetchingLoop();
    if(result){
        loopCount++;
        console.log(`Loop: ${loopCount}`);
        console.log(`Seed: ${currentSeed}`);
        console.log(`T: ${TCount}, ${((TCount/(TCount+CTCount+DiceCount))*100).toFixed(2)}%`);
        console.log(`CT: ${CTCount}, ${((CTCount/(TCount+CTCount+DiceCount))*100).toFixed(2)}%`);
        console.log(`Dice: ${DiceCount}, ${((DiceCount/(TCount+CTCount+DiceCount))*100).toFixed(2)}%`);
        console.log(`Trains: Total: ${trains.length}`);
        trains.forEach(train => {
            if(train.count > highestTrainCount){
                highestTrainCount = train.count;
                highestTrain = train;
            }
        });
        console.log(`Highest Train: Side: ${highestTrain.side}, Count: ${highestTrain.count}`);
        currentSeed-=1;
    }
    setTimeout(startLoop, callDelays);
}

startLoop();
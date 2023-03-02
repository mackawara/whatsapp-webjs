
const axios = require("axios");


const getLiveMatches=async(type)=>{
  const options = {
    method: 'GET',
    url: 'https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPIKEY,
      'X-RapidAPI-Host': process.env.RAPIDAPIHOST
    }
  };
axios.request(options).then(function (response) {
	const matches=response.data.typeMatches[0].seriesMatches;
  //console.log(matches
  let matchesList=[]
  matches.forEach((item)=>{
    if (item.seriesAdWrapper){
matchesList.push(item.seriesAdWrapper.matches[0])
    }
  })
  matchesList.forEach(match=>{
    const matchInfo=match.matchInfo
    const matchID=matchInfo.matchId
    const seriesName=matchInfo.seriesName
    const seriesID=matchInfo.seriesId
    const homeTeam=matchInfo.team1.name
    const awayTeam=matchInfo.team2
    const matchScore=matchInfo.matchScore
    const matchStatus=matchInfo.status
    const message=`${seriesName} \n `
    
  })
  console.log(matchesList)
  //console.log(matches[0].seriesAdWrapper.matches[0].matchScore)
//console.log(matchesList)
}).catch(function (error) {
	console.error(error);
})};
module.exports=getLiveMatches
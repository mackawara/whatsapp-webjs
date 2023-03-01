const axios = require("axios");

const options = {
  method: 'GET',
  url: 'https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live',
  headers: {
    'X-RapidAPI-Key': 'cc64b81c8bmsh6a9c9b8997f5cd8p10883djsn39306bfbd263',
    'X-RapidAPI-Host': 'cricbuzz-cricket.p.rapidapi.com'
  }
};
const getLiveMatches=async()=>{
axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
})};
module.exports=getLiveMatches
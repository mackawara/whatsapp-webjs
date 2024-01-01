const axios = require('axios');
const system=require('../../../constants/system')
const getTopScorers=async(league)=>{

const options = {
  method: 'GET',
  url: `${system.FOOTBALL_API_URL}/players/topscorers`,
  params: {
    league: league,
    season: system.SEASON,
  },
  headers: system.REQUEST_HEADERS ;
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}
}
require('dotenv').config();

const REQUEST_HEADERS = {
  'X-RapidAPI-Key': process.env.FOOTBALLAPIKEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
};
const LEAGUES_FOLLOWED = [3, 2, 401, 135, 39, 140];
const AMNESTYGROUP = process.env.AMNESTYGROUP;
const FOOTBALL_API_URL = `https://api-football-v1.p.rapidapi.com/v3`;
const UPDATE_INTERVAL = 66000;
module.exports = {
  REQUEST_HEADERS,
  FOOTBALL_API_URL,
  LEAGUES_FOLLOWED,
  UPDATE_INTERVAL,
  AMNESTYGROUP,
};

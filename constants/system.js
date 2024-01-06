const { startOfYesterday, endOfTomorrow, addDays } = require('date-fns');
require('dotenv').config();

const REQUEST_HEADERS = {
  'X-RapidAPI-Key': process.env.FOOTBALLAPIKEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
};
const LEAGUES_FOLLOWED = [3, 2, 4, 401, 6, 135, 39, 140];
const AMNESTYGROUP = process.env.AMNESTYGROUP;
const SOCCERUPDATE_GROUP = process.env.SOCCER_UPDATES_1;

const FOOTBALL_API_URL = `https://api-football-v1.p.rapidapi.com/v3`;
const GROUP_INVITE =
  'For real time live scores updated every 5-10 minutes, statistics, standings, odds and all soccer news please join this group or add this number Soccerbot to your group! https://chat.whatsapp.com/EjpJ7BMGlW044kCYNfFHAi';
const UPDATE_INTERVAL = 660000;
const YESTERDAY = startOfYesterday();
const TOMMOROW = endOfTomorrow();
const SEVEN_DAYS_FROM_NOW = addDays(new Date(), 7);
const SEASON = '2023';
const ADMIN = process.env.ME;
module.exports = {
  REQUEST_HEADERS,
  FOOTBALL_API_URL,
  LEAGUES_FOLLOWED,
  UPDATE_INTERVAL,
  AMNESTYGROUP,
  YESTERDAY,
  TOMMOROW,
  SEVEN_DAYS_FROM_NOW,
  SEASON,
  GROUP_INVITE,
};

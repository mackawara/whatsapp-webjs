const { startOfYesterday, endOfTomorrow, addDays } = require('date-fns');
require('dotenv').config();

const REQUEST_HEADERS = {
  'X-RapidAPI-Key': process.env.FOOTBALLAPIKEY,
  'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
};
const LEAGUES_FOLLOWED = [3, 2, 4, 7, 401, 6, 143, 135, 556, 39, 140];
const AMNESTYGROUP = process.env.AMNESTYGROUP;
const SOCCERUPDATE_GROUP = process.env.SOCCER_UPDATES_1;
const ME = process.env.ME;

const FOOTBALL_API_URL = `https://api-football-v1.p.rapidapi.com/v3`;
const GROUP_INVITE =
  'For live scores during live games, statistics, standings, odds and all soccer news join this group or add SoccerBot to your group 263711489602! https://chat.whatsapp.com/EjpJ7BMGlW044kCYNfFHAi';
const UPDATE_INTERVAL = 1800000;
const YESTERDAY = startOfYesterday();
const TOMMOROW = endOfTomorrow();
const SEVEN_DAYS_FROM_NOW = addDays(new Date(), 7);
const SEASON = '2023';
const NODE_ENV = process.env.NODE_ENV;
const ADMIN = process.env.ME;
module.exports = {
  REQUEST_HEADERS,
  FOOTBALL_API_URL,
  LEAGUES_FOLLOWED,
  UPDATE_INTERVAL,
  NODE_ENV,
  AMNESTYGROUP,
  YESTERDAY,
  TOMMOROW,
  ME,
  SEVEN_DAYS_FROM_NOW,
  SEASON,
  GROUP_INVITE,
};

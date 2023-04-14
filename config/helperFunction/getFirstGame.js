const firstGame = async (gamesArray, times) => {
  let first;
  let times = [];
  await gamesArray.forEach((game) => times.push(game[times]));
  const firstGameTime = Math.min(times.values);
  const firstGame = gamesArray.filter(
    (game) => game[times] == firstGameTime
  )[0];
  return firstGame;
};
module.exports = firstGame;

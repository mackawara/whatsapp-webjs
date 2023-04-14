module.exports = getHrsMins = (timeStamp) => {
  let mins, hrs;
  mins = new Date(timeStamp * 1000).getMinutes();
  hrs = new Date(timeStamp * 1000).getHours();

  return [mins, hrs];
};

const timeConverter = (UNIX_timestamp) => {
  const a = new Date(UNIX_timestamp);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const year = a.getFullYear();
  const month = months[a.getMonth()];
  const date = a.getDate();
  const hour = a.getHours();
  const min = a.getMinutes();
  const sec = a.getSeconds();
  const time = hour + ":" + min + "0 GMT";
  const dateFull = `${date} ${month} ${year}`;
  const dateArr = [time, dateFull];

  return dateArr;
};
module.exports = timeConverter;

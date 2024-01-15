const winston = require('winston');
const LEVELS = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
const transports = LEVELS.map(level => {
  return new winston.transports.File({
    filename: `${level}.log`,
    level: level,
  });
});
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  //transports: transports,
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = logger;

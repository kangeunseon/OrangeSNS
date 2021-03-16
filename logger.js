const { createLogger, format, transports } = require("winston");
const { combine, timestamp, prettyPrint } = format;
require("winston-daily-rotate-file");
const fs = require("fs");

if (!fs.existsSync("log")) {
  //log폴더 있는지 체크-생성
  fs.mkdirSync("log");
}

const dailyFileTransport = new transports.DailyRotateFile({
  level: "info",
  filename: `log/app_%DATE%.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const logger = createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), prettyPrint()),
  transports: [
    //new transports.File({ filename: "combined.log" }),
    //new transports.File({ filename: "error.log", level: "error" }),
    dailyFileTransport,
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({ format: format.simple() }));
}

module.exports = logger;

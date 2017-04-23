var fs = require('fs');

module.exports = {
  logInfo: function (fileName, message) {
    var _message = `[${getDateTime()}] ${message}\r\n`;
    try {
        console.log(_message);
        fs.appendFileSync(fileName, _message);
    } catch (err) {
        console.log(`[${getDateTime()}] Unable to write logs to disk (filePath: ${fileName}). See error: ${err.message}\r\n`);
    }
  }
};

function getDateTime(){
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec;
}
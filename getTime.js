function getTime() {
  const date = new Date();

  const pad = (num, size) => {
    let s = String(num);
    while (s.length < size) s = "0" + s;
    return s;
  };

  const YYYY = date.getFullYear();
  const MM = pad(date.getMonth() + 1, 2);
  const DD = pad(date.getDate(), 2);
  const hh = pad(date.getHours(), 2);
  const mm = pad(date.getMinutes(), 2);
  const ss = pad(date.getSeconds(), 2);
  const ms = pad(date.getMilliseconds(), 3);

  const microseconds = "000";

  const timezoneOffset = -date.getTimezoneOffset();
  const sign = timezoneOffset >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(timezoneOffset) / 60), 2);
  const offsetMinutes = pad(Math.abs(timezoneOffset) % 60, 2);

  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}.${ms}${microseconds}${sign}${offsetHours}:${offsetMinutes}`;
}

function parseTimes(time) {
  const date = new Date(time);
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(date);

  const weekday = parts.find((part) => part.type === "weekday").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;
  const year = parts.find((part) => part.type === "year").value;
  const hour = parts.find((part) => part.type === "hour").value;
  const minute = parts.find((part) => part.type === "minute").value;
  const second = parts.find((part) => part.type === "second").value;
  const timeZoneName = parts.find((part) => part.type === "timeZoneName").value;

  return `${weekday}, ${day} ${month} ${year} ${hour}:${minute}:${second} ${timeZoneName}`;
}

function genRelativeTimeStr(nextTime, risen) {
  const eventDate = new Date(nextTime);
  const now = new Date();

  const diffInMs = eventDate - now;

  if (diffInMs <= 0) {
    return risen ? "The moon has already set." : "The moon has already risen.";
  }

  const diffInHours = diffInMs / (1000 * 60 * 60);
  const hours = Math.round(diffInHours);

  const optionsTime = { hour: "numeric", minute: "numeric", hour12: true };
  const formattedTime = eventDate.toLocaleTimeString("en-GB", optionsTime);

  const eventDateOnly = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
  );
  const nowDateOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const oneDayInMs = 24 * 60 * 60 * 1000;

  let dayIndicator = "today";
  if (eventDateOnly - nowDateOnly >= oneDayInMs) {
    dayIndicator = "tomorrow";
  }

  const action = risen ? "set" : "rise";

  return `The moon will ${action} in ${hours} hour${
    hours !== 1 ? "s" : ""
  } at ${formattedTime.split(" ").join("")} ${dayIndicator}`;
}

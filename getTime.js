function getFormattedLocalTime() {
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

const localTime = getFormattedLocalTime();
console.log(localTime);

const getCurrentSemesterCode = (dateInput = new Date()) => {
  const date = new Date(dateInput);
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;

  const month = validDate.getMonth(); // 0 = Jan, 11 = Dec
  const year = String(validDate.getFullYear()).slice(-2); // 2-digit year e.g. "26"

  let term = "SP";
  if (month >= 0 && month <= 3) {
    term = "SP"; // Spring: Jan - Apr
  } else if (month >= 4 && month <= 7) {
    term = "SU"; // Summer: May - Aug
  } else {
    term = "FA"; // Fall: Sep - Dec
  }

  return `${term}${year}`;
};

module.exports = { getCurrentSemesterCode };

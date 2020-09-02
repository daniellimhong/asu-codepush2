export const addTh = numberString => {
  switch (numberString) {
    case "1":
      return "1st";
    case "2":
      return "2nd";
    case "3":
      return "3rd";
    case "4":
      return "4th";
    default:
      return "";
  }
};

export const getPercent = (converted, attemps) => {
  const percent = Math.floor((converted / attemps) * 100);
  return percent ? percent : 0;
};

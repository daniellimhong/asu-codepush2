export const removeAt = string => {
  if (string.includes("@")) {
    return string.replace("@", "");
  } else {
    return string;
  }
};

export const getFirstFive = games => {
  if (games && games.length >= 5) {
    const sliced = games.slice(0, 5);
    return sliced;
  } else {
    return games;
  }
};

export const splitSentences = string => {
  if (string) {
    const result = string.match(/[^\.!\?]+[\.!\?]+/g);
    for (let i = 0; i < result.length; i++) {
      result[i] = result[i].trim();
    }
    // console.log("this is splitSentences ", result);
    return result;
  } else {
    return "";
  }
};

export const getLastTransaction = (transactions, typeOfTransaction) => {
  if (typeOfTransaction === "Dining") {
    if (transactions && transactions.length > 0) {
      const diningTransactions = transactions.filter(v => {
        return v.type === "meal";
      });
      // let sortedDiningTransactions = diningTransactions.sort(compare);
      // console.log("sortedDiningTransactions ", sortedDiningTransactions);
      return diningTransactions[0];
    }
  } else if (transactions && transactions.length > 0) {
    const mAndGTransactions = transactions.filter(v => {
      return v.type === "m&g";
    });
    // let sortedMAndGTransactions = mAndGTransactions.sort(compare);
    // console.log("sortedMAndGTransactions ", sortedMAndGTransactions);
    return mAndGTransactions[0];
  }
};

export const compare = (a, b) => {
  if (a.timestamp < b.timestamp) {
    return 1;
  }
  if (a.timestamp > b.timestamp) {
    return -1;
  }
  return 0;
};

export const compareDisplayOrder = (a, b) => {
  if (Number(a.displayOrder < b.displayOrder)) {
    return -1;
  }
  if (a.displayOrder > b.displayOrder) {
    return 1;
  }
  return 0;
};

export const removeMinusFromString = string => {
  const stringArray = string.split("");
  let newStringArray = "";
  for (let i = 0; i < stringArray.length; i++) {
    if (stringArray[i] !== "-") {
      newStringArray += stringArray[i];
    }
  }
  return newStringArray;
};

export const splitStringAtBrackets = string => {
  const inBracketsResult = /\(([^)]*)\)/.exec(string)[1];
  // console.log("inBracketsResult ", inBracketsResult);
};

export const createMealAmountString = amount => {
  amount = amount.toString();
  const isGreaterThanOne = Number(removeMinusFromString(amount)) > 1;
  const mealAmount = `${removeMinusFromString(amount)} ${
    isGreaterThanOne ? "meals" : "meal"
  }`;
  return mealAmount;
};

export const createMealBalanceString = amount => {
  amount = amount.toString();
  const finalString = "remaining this week";
  const isGreaterThanOne = Number(removeMinusFromString(amount)) > 1;
  const mealAmount = `${removeMinusFromString(amount)} ${
    isGreaterThanOne ? "meals" : "meal"
  } ${finalString}`;
  return mealAmount;
};

export const splitStringAtFirst = string => {
  // let splitsAtPar = string.split(/(-())+/);

  const regExp = /\(([^)]+)\)/;
  const matches = regExp.exec("I expect five hundred dollars ($500).");
  return "Test";
};

export const insertWordIntoString = (string, word) => {
  const wordToReplace = "activate/deactivate";
  if (string) {
    if (string.includes("activate/deactivate")) {
      return string.replace(wordToReplace, word);
    } else {
      return string;
    }
  } else {
    return "";
  }
};

export const capitalizeFirstLetter = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const filterAllTransactions = (which, arrayOfTransactions) => {
  // console.log("filterAllTransactions ", which, arrayOfTransactions);
  if (which && arrayOfTransactions && Array.isArray(arrayOfTransactions)) {
    const filteredArray = arrayOfTransactions.filter(v => v.type === which);
    return filteredArray.length > 0 ? filteredArray : null;
  } else {
    return null;
  }
};

export const organizeVenues = arrayOfVenues => {
  if (Array.isArray(arrayOfVenues)) {
    const obj = {};
    for (let i = 0; i < arrayOfVenues.length; i++) {
      if (obj[arrayOfVenues[i].campus]) {
        obj[arrayOfVenues[i].campus].push(arrayOfVenues[i]);
      } else {
        obj[arrayOfVenues[i].campus] = [arrayOfVenues[i]];
      }
    }
    // console.log(Object.entries(obj));
    return Object.entries(obj);
  } else {
    return null;
  }
};

export const filterVenues = (arrayOfVenues, which) => {
  let filteredArrayOfVenues;
  if (which === "Open Now") {
    filteredArrayOfVenues = arrayOfVenues.filter(v => {
      return v.currentlyServing;
    });
  } else if (which === "Near Me") {
    filteredArrayOfVenues = arrayOfVenues.filter(v => {
      return Number(v.distance) < 2;
    });
  } else {
    filteredArrayOfVenues = arrayOfVenues;
  }
  return organizeVenues(filteredArrayOfVenues);
};

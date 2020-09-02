export const returnFirstName = fullName => {
  let array = fullName.split(" ");
  return array[0];
};

export const makeObjectArray = object => {
  let arrayOfSelectedOutcomes = [];
  let selectedOutcomes = object;
  for (let key in selectedOutcomes) {
    arrayOfSelectedOutcomes.push({ [selectedOutcomes[key]]: key });
  }
  return arrayOfSelectedOutcomes;
};

export const areAllFourCompleted = obj => {
  let count = 0;
  for (let key in obj) {
    if (obj[key] === "SELECTED") {
      count += 1;
    }
  }
  return count === 4 ? true : false;
};

export const isObjectEmpty = obj => {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};

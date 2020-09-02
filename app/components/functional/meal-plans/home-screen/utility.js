import moment from "moment";

export const compareTransactionTypes = (mealPlan, mAndG) => {
  if (!mealPlan) {
    return mAndG;
  } else if (!mAndG) {
    return mealPlan;
  } else if (mealPlan.timeStamp >= mAndG.timeStamp) {
    return mealPlan;
  } else {
    return mAndG;
  }
};

export const getCurrentVenueStatus = arrayOfVenues => {
  const dayOfTheWeek = moment(new Date()).day();
  // console.log(dayOfTheWeek);
  // console.log("yes ", getCurrentDayTimes(arrayOfVenues[0].times.Days));
  for (let i = 0; i < arrayOfVenues.length; i++) {
    if (arrayOfVenues[i].times) {
      arrayOfVenues[i].currentlyServing = getCurrentDayTimes(
        arrayOfVenues[i].times.Days
      );
    }
  }
  return arrayOfVenues;
};
const getCurrentDayTimes = arrayOfDays => {
  const currentTime = moment(new Date());
  const currentDayNumber = currentTime.day();
  const currentExactTime = currentTime.format("HH:mm");
  // console.log("currentExactTime ", currentExactTime);
  if (arrayOfDays.length === 7) {
    const arr = [...arrayOfDays];
    const shifted = arr.pop();
    arr.unshift(shifted);
    const mealPeriods = arr[currentDayNumber].MealPeriods;
    for (let i = 0; i < mealPeriods.length; i++) {
      if (
        convertTimeToNumber(currentExactTime) >=
          convertTimeToNumber(mealPeriods[i].Start) &&
        convertTimeToNumber(currentExactTime) <
          convertTimeToNumber(mealPeriods[i].End)
      ) {
        return mealPeriods[i];
      }
    }
    return null;
  } else {
    return null;
  }
};

const convertTimeToNumber = numberString => {
  numberString = numberString.replace(/:/g, ".");
  return Number(numberString);
};

export const createServingString = servingObj => {
  // console.log("servingObj ", servingObj);
  if (servingObj) {
    const start = makeStandardTime(servingObj.Start);
    const end = makeStandardTime(servingObj.End);
    return `${start} - ${end}`;
  } else {
    return "Currently Closed";
  }
};

export const makeStandardTime = time => {
  return moment(time, "HH:mm").format("h:mm A");
};

export const sortNearestRestaurants = arrayOfRestaurants => {
  if (arrayOfRestaurants) {
    const withFavorites = checkForFavorites(arrayOfRestaurants);
    withFavorites.array.sort((a, b) => a.distance - b.distance);
    // console.log("withFavorites ", withFavorites);
    const arrayOfClosest = [];
    const lengthToReturn =
      withFavorites.array.length > 1 ? 2 : withFavorites.array.length;
    for (let i = 0; i < withFavorites.array.length; i++) {
      if (i < 2) {
        arrayOfClosest.push(withFavorites.array[i]);
      }
    }
    return { array: arrayOfClosest, favorites: withFavorites.favorites };
  } else {
    return { array: [] };
  }
};

const checkForFavorites = array => {
  const favorites = array.filter((v, i) => {
    return v.favorite;
  });
  // console.log("my favorites ", favorites);
  if (favorites.length > 0) {
    return { array: favorites, favorites: true };
  } else {
    return { array, favorites: false };
  }
};

organizeDays = arrayOfDays => {
  const arr = [...arrayOfDays];
  arr.shift(arr.unshift());
  // console.log(arr);
  return arr;
};

sortOpenRestaurants = venues => {
  // console.log("NearbyOpenDining venues ", venues);
  const dayOfTheWeek = moment(new Date()).day();
  // console.log(dayOfTheWeek);
  // console.log("yes ", this.organizeDays(venues[0].times.Days));
};

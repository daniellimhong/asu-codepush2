import moment from "moment";

export const createServingString = servingObj => {
  console.log("servingObj ", servingObj);
  if (servingObj) {
    const start = makeStandardTime(servingObj.Start);
    const end = makeStandardTime(servingObj.End);
    return `Serving ${servingObj.MealPeriod}: ${start} - ${end}`;
  } else {
    return "Currently Closed";
  }
};

export const makeStandardTime = time => {
  return moment(time, "HH:mm").format("h:mm A");
};

const addUnderscore = string => string.split(" ").join("_");

export const makeFoodPreferencesObject = foodPreferences => {
  // console.log("myFoodPreferences ", foodPreferences);
  let allergens = [];
  let preferences = [];
  if (foodPreferences && foodPreferences.allergens) {
    const allergenKeys = {
      Eggs: "ContainsEggs",
      Fish: "ContainsFish",
      Milk: "ContainsMilk",
      Peanuts: "ContainsPeanuts",
      Shellfish: "ContainsShellfish",
      Soy: "ContainsSoy",
      Tree_Nuts: "ContainsTreeNuts",
      Wheat: "ContainsWheat"
    };
    allergens = foodPreferences.allergens.map(v => {
      const keyToCheck = addUnderscore(v);
      return allergenKeys[keyToCheck];
    });
  }
  if (foodPreferences && foodPreferences.preferences) {
    const preferencesKeys = {
      Made_without_Gluten: "IsGlutenFree",
      Vegan: "IsVegan",
      Vegetarian: "IsVegetarian"
    };
    preferences = foodPreferences.preferences.map(v => {
      const keyToCheck = addUnderscore(v);
      return preferencesKeys[keyToCheck];
    });
  }
  return {
    allergens,
    preferences
  };
};

export const separateMeals = (meals, foodPreferences, whichMealSelected) => {
  const arrayOfMeals = meals.map((v, i) => {
    // console.log("dataToAddFirst", organizeMealsData(v));
    const filteredData = filterPreferences(
      organizeMealsData(v),
      foodPreferences
    );
    // console.log("after ", filteredData);
    return {
      mealPeriod: v.MealPeriod,
      data: filteredData
    };
  });
  // console.log(
  //   "arrayOfMeals and whichMealSelected",
  //   whichMealSelected,
  //   arrayOfMeals
  // );
  // console.log("moveItemToTop ", moveItemToTop(arrayOfMeals, whichMealSelected));
  return moveItemToTop(arrayOfMeals, whichMealSelected); // from 1 item to 2 items in array
};

export const moveItemToTop = (array, which) => {
  if (which && Array.isArray(array) && array.length > 0) {
    // console.log(array.indexOf(mealPeriod[which]));
    let selectedItem;
    array.forEach((v, i) => {
      if (v.mealPeriod === which) {
        selectedItem = v;
        array.splice(i, 1);
      }
    });
    // console.log(array);
    if (selectedItem) array.unshift(selectedItem);
  }
  return array;
};

const filterPreferences = (arrayOfMealItems, foodPreferences) => {
  if (foodPreferences) {
    const preferences = makeFoodPreferencesObject(foodPreferences);
    const filteredArray = arrayOfMealItems.map((v, i) => {
      const items = v.Items.filter(item => {
        let shouldReturn = true;
        // console.log("testing ", item[preferences.allergens[0]], item);
        for (let i = 0; i < preferences.allergens.length; i++) {
          if (item[preferences.allergens[i]]) {
            shouldReturn = false;
            break;
          }
        }
        for (let i = 0; i < preferences.preferences.length; i++) {
          if (item[preferences.preferences[i]] === false) {
            shouldReturn = false;
            break;
          }
        }
        return shouldReturn;
      });
      return {
        Name: v.Name,
        Sort: v.Sort,
        Items: items
      };
    });
    // console.log("filteredArray ", filteredArray);
    const removeEmptySections = filteredArray.filter((v, i) => {
      return v.Items.length > 0;
    });
    return removeEmptySections;
  } else {
    return arrayOfMealItems;
  }
};

const organizeMealsData = mealData => {
  // console.log("mealData ", mealData);
  // const lunch = mealData.MealPeriods[0];
  const allCategories = [];
  for (let i = 0; i < mealData.Stations.length; i++) {
    for (let j = 0; j < mealData.Stations[i].SubCategories.length; j++) {
      allCategories.push(mealData.Stations[i].SubCategories[j]);
    }
  }
  // console.log("allCategories ", allCategories);
  return allCategories;
};

export const getNutrients = allKeys => {
  // console.log("getNutrients", allKeys);
  return {
    calsType: "cals",
    cals: getNumber(allKeys.Calories),
    carbsType: " g",
    carbs: getNumber(allKeys.TotalCarbohydrates),
    fatType: " g",
    fat: getNumber(allKeys.TotalFat),
    proteinType: " g",
    protein: getNumber(allKeys.Protein)
  };
};

export const getNumber = string => {
  if (string && typeof string === "number") return string;
  else if (string && typeof string === "string") {
    return Number(string.replace(/\D/g, ""));
  } else {
    return 0;
  }
};

export const setActive = (array, foodPreferences, which) => {
  if (foodPreferences) {
    // console.log("foodPreferences", array, foodPreferences);
    const userPreferences = foodPreferences[which]
      ? foodPreferences[which]
      : [];
    for (let i = 0; i < array.length; i++) {
      array[i].active = false;
      for (let j = 0; j < userPreferences.length; j++) {
        if (array[i].name === userPreferences[j]) {
          array[i].active = true;
        }
      }
    }
    return array;
  }
};

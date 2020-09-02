export const makeNumber = num => Number(num.replace(/[^0-9]/g, ""));

export const checkIfEmployee = array => {
  if (array) {
    for (let i = 0; i < array.length; i++) {
      if (
        array[i] === "Employee" ||
        array[i] === "Courtesy Affiliate" ||
        array[i] === "Faculty"
      ) {
        return true;
      }
    }
  }
  return false;
};

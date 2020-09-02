import { makeStandardTime, moveItemToTop, getNumber } from "./utility";

it("Should set a time with am/pm", () => {
  expect(makeStandardTime("13:00")).toBe("1:00 PM");
});

it("Should set a time with am/pm", () => {
  expect(makeStandardTime("17 hundred hours")).toBe("5:00 PM");
});

it("Should set a time with am/pm", () => {
  expect(makeStandardTime(false)).toBe("Invalid date");
});

const arrayOfObjs = [
  { mealPeriod: "Lunch" },
  { mealPeriod: "Brunch" },
  { mealPeriod: "Midnight Snack" },
  { mealPeriod: "Breakfast" }
];
it("should move item in array to the front", () => {
  expect(moveItemToTop(arrayOfObjs, "Brunch")[0].mealPeriod).toBe("Brunch");
});

it("should return the empty array", () => {
  expect(moveItemToTop([], "Brunch")).toEqual([]);
});

it("should return the the bool", () => {
  expect(moveItemToTop(false, "Brunch")).toBe(false);
});

it("should return the array", () => {
  expect(moveItemToTop(arrayOfObjs, "Brunchss")[0].mealPeriod).toBe("Brunch");
});

it("should only return the numbers in the string", () => {
  expect(getNumber("a bunch of stuff17fdfd")).toBe(17);
});

it("should return the number", () => {
  expect(getNumber(19)).toBe(19);
});

it("should return 0", () => {
  expect(getNumber([])).toBe(0);
});

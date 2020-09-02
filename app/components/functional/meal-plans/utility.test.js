import {
  splitSentences,
  removeMinusFromString,
  createMealAmountString,
  createMealBalanceString,
  insertWordIntoString,
  capitalizeFirstLetter,
  filterAllTransactions
} from "./utility";

const message = "First. Second.";
it("should return array of strings", () => {
  expect(splitSentences(message)).toEqual(["First.", "Second."]);
});

it("should remove the minus from string", () => {
  expect(removeMinusFromString("--10212-")).toBe("10212");
});

it("should remove the minus from & leave decimal", () => {
  expect(removeMinusFromString("--10.212-")).toBe("10.212");
});

it("should return a string with good english", () => {
  expect(createMealAmountString("-1")).toBe("1 meal");
});

it("should return a string with good english", () => {
  expect(createMealAmountString("1")).toBe("1 meal");
});

it("should return a string with an s", () => {
  expect(createMealAmountString("-2")).toBe("2 meals");
});

it("should return a string with an s", () => {
  expect(createMealAmountString(-11)).toBe("11 meals");
});

it("should return a string with an s", () => {
  expect(createMealBalanceString("-11")).toBe("11 meals remaining this week");
});

it("should return a string without an s", () => {
  expect(createMealBalanceString("1")).toBe("1 meal remaining this week");
});

it("should return a string without an s", () => {
  expect(createMealBalanceString("-1")).toBe("1 meal remaining this week");
});

it("should return a string without an s", () => {
  expect(createMealBalanceString(1)).toBe("1 meal remaining this week");
});

it("should return a string without an s", () => {
  expect(createMealBalanceString(-1)).toBe("1 meal remaining this week");
});

const string = "Can you activate/deactivate";
it("Should replace a string with the second variable  ", () => {
  expect(insertWordIntoString(string, "hello")).toBe("Can you hello");
});

const string1 = "Can you activate/deact1ivate";
it("Should not replace a string with the second variable  ", () => {
  expect(insertWordIntoString(string1, "hello")).toBe(
    "Can you activate/deact1ivate"
  );
});

it("Should return an empty string", () => {
  expect(insertWordIntoString(undefined, "hello")).toBe("");
});

const allTransactionsArray = null;
it("Should filter for only one type of transaction", () => {
  expect(filterAllTransactions("m&g", allTransactionsArray)).toBeFalsy();
});

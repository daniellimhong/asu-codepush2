import moment from "moment";

export function getUnixNumDOW(unixTimestamp) {
  const dowNumber = moment(unixTimestamp).format("e");
  return dowNumber;
};

import moment from "moment";
import axios from "axios";
import Testers from "../../../services/shared/testers";

/**
 * Make an ID in the form of an AppSync autoId.
 */
export function makeAutoId() {
  let messageId = "";
  for (let i = 0; i < 5; i++) {
    let length = 4;
    let append = "-";
    if (i === 0) {
      length = 8;
    } else if (i === 4) {
      length = 12;
      append = "";
    }
    messageId = messageId + makeid(length) + append;
  }
  return messageId;
}

/**
 * Generate a random string of characters
 * @param {*} length
 */
function makeid(length) {
  let text = "";
  const possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

/**
 * Determine how to display chat dates and times.
 * If its same-day then we display the time, otherwise the date
 * @param {*} timestamp
 */
export function determineTimeFormat(timestamp) {
  const todayTimestamp = new Date().getTime();
  const shouldRenderDate = moment(Number(timestamp)).isBefore(
    todayTimestamp,
    "day"
  );
  if (!shouldRenderDate) {
    return moment(timestamp, "x").format("LT");
  } else {
    return moment(timestamp, "x").format("l");
  }
}

export function isUserApprovedForChat(user) {
  const promise = new Promise((resolve, reject) => {
    const testersInstance = Testers.getInstance();
    const testers = testersInstance.getTesters();
    const fetchDeactivatedURL = `https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/settings/chat-status?asurite=${user}`;
    axios.get(fetchDeactivatedURL).then(resp => {
      // console.log(resp);
      if (resp.data.chatDeactivated) {
        resolve(false);
        return promise;
      } else {
        for (let i = 0; i < testers.length; i++) {
          if (testers[i].asurite === user && testers[i].isActive) {
            resolve(true);
            return promise;
          }
        }
        const fetchUrl = `https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/user-details?asurite=${user}`;
        axios.get(fetchUrl).then(response => {
          if (response.data && response.data.roleList.includes("student")) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    });
  });
  return promise;
}

export function showRow(name, filter, asurite) {
  if (asurite !== "ASU-sunnybot") {
    try {
      name = name.replace(/\s/g, "").toLowerCase();
      filter = filter.replace(/\s/g, "").toLowerCase();

      return name.indexOf(filter) > -1;
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}

/**
 * Bubble friends up to the front of the array of searched users
 * @param {*} users
 * @param {*} friends
 */
export function bubbleFriendsAndFilter(users = [], friends = []) {
  function checkFriend(asurite, friendsList) {
    for (let k = 0; k < friendsList.length; k++) {
      if (asurite === friendsList[k].friend) {
        return true;
      }
    }
    return false;
  }

  let friendBound = 0;

  for (let i = users.length - 1; i >= 0; i--) {
    if (!isStudent(users[i]._source) && !isTester(users[i]._id)) {
      users.splice(i);
    } else if (checkFriend(users[i]._id, friends)) {
      const tmp = { ...users[friendBound] };
      users[friendBound] = { ...users[i] };
      users[i] = tmp;
      friendBound++;
    }
  }

  return users;
}

function isTester(user) {
  const testersInstance = Testers.getInstance();
  const testers = testersInstance.getTesters();
  for (let i = 0; i < testers.length; i++) {
    if (testers[i].asurite === user && testers[i].isActive) {
      return true;
    }
  }
  return false;
}

function isStudent(source) {
  try {
    return source.affiliations.includes("Student");
  } catch (e) {
    return false;
  }
}

export function groupMessages(messages = [], index = 0) {
  function sameSender(current, next) {
    if (current.sender === next.sender) {
      return true;
    }
    return false;
  }
  function sentConsecutively(current, next) {
    if (next.createdAt - current.createdAt < 60000) {
      return true;
    }
    return false;
  }
  if (index > 0 && messages.length > 0) {
    const current = messages[index];
    const next = messages[index - 1];
    if (current.sender && next.sender) {
      if (sameSender(current, next) && sentConsecutively(current, next)) {
        return true;
      }
    } else {
      return false;
    }
  }
  return false;
}

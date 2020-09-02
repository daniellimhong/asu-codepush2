export * from "./Activities";
export * from "./AllSurveyQuery";
export * from "./Engagements";
export * from "./Feed";
export * from "./Friends";
export * from "./LiveCardQueries";
export * from "./PreferenceQueries";
export * from "./ScheduleQueries";
export * from "./ReminderQueries";
export * from "./Utility";
export * from "./builders";

export * from "./LawDisclosures";
export * from "./Wellness";

/**
 * Given an array of keys correlating with saved News or Events,
 * return true or false on whether the provided item's key
 * is in the array.
 * @param {*} key
 * @param {*} keyArray
 */
export function checkSaved(key, keyArray) {
  for (var i = 0; i < keyArray.length; i++) {
    if (keyArray[i].key == key && keyArray[i].active === "1") {
      return true;
    }
  }
  return false;
}

export function urldecode(url) {
  try {
    if (url && typeof url.replace === "function") {
      return decodeURIComponent(url.replace(/\+/g, " "));
    }
  } catch (e) {
    return url;
  }
}

export function undoEscape(data) {
  let escaped = [];
  if (data && data.length) {
    data.forEach(entry => {
      let item = { ...entry };
      for (var k in item) {
        try {
          if (item.hasOwnProperty(k) && k !== "key") {
            item[k] = urldecode(item[k]);
          }
        } catch (e) {
          item[k] = item[k];
        }
      }
      escaped.push(item);
    });
  }
  return escaped;
}

/**
 * Accepts a target asurite and whatever the target asurite returns.
 *
 * Since there may be several responses due to a dirty check, we need to
 * confirm that we cgrab the correct iSearch response.
 */
export function iSearchHandler(asurite, user_info) {
  let container = {};
  if (asurite) {
    return buildObject(container, asurite, user_info);
  } else {
    return {};
  }
}

function buildObject(container, asurite, user_info) {
  let iSearchObject = userFromResponse(container, asurite, user_info);
  container.iSearchObject = iSearchObject;

  return {
    asuriteId: asurite,
    displayName: getDisplayName(container, asurite, user_info),
    affiliations: getAffiliations(container, asurite, user_info),
    majorCampuses: getMajorCampuses(container, asurite, user_info),
    majors: getMajors(container, asurite, user_info),
    programs: getPrograms(container, asurite, user_info),
    photoUrl: getPhotoUrl(container, asurite, user_info),
    primaryDeptId: getPrimaryDeptId(container, asurite, user_info),
    workingTitle: workingTitle(container, asurite, user_info),
    student_status: getStudentStatus(container, asurite, user_info),
    phone: getPhoneNumber(container, asurite, user_info)
  };
}

function getStudentStatus(container, asurite, user_info) {
  let affiliations = getAffiliations(container, asurite, user_info);

  if (
    affiliations.indexOf("Student") >= 0 ||
    asurite == "jlongie" ||
    asurite == "kchris16" ||
    asurite == "bigmuff" ||
    asurite == "ngoble" ||
    // asurite == "kcoblent" ||
    asurite == "madmello" ||
    asurite == "zazaidi" ||
    asurite == "lmurph20" ||
    asurite == "kmukher1" ||
    asurite == "acolli19" ||
    asurite == "jjdoe" ||
    asurite == "sreekesh" ||
    asurite == "sadusum5"
  ) {
    return true;
  }

  return false;
}

function workingTitle(container, asurite, user_info) {
  if (container.iSearchObject && container.iSearchObject.workingTitle) {
    return container.iSearchObject.workingTitle;
  }
  return "";
}

function getPhoneNumber(container, asurite, user_info) {
  if (container.iSearchObject && container.iSearchObject.phone) {
    return container.iSearchObject.phone;
  }
  return "";
}

function getPrimaryDeptId(container, asurite, user_info) {
  if (container.iSearchObject && container.iSearchObject.primaryDeptid) {
    return container.iSearchObject.primaryDeptid;
  }
  return "";
}

function getPhotoUrl(container, asurite, user_info) {
  if (container.iSearchObject && container.iSearchObject.asuriteId) {
    return (
      "https://dfio2znln0m7k.cloudfront.net/" +
      container.iSearchObject.asuriteId +
      "?size=small"
    );
  }
  return "";
}

function getMajors(container, asurite, user_info) {
  if (
    container.iSearchObject &&
    container.iSearchObject.majors &&
    container.iSearchObject.majors.length > 0
  ) {
    return container.iSearchObject.majors;
  }
  return [];
}

function getPrograms(container, asurite, user_info) {
  if (
    container.iSearchObject &&
    container.iSearchObject.programs &&
    container.iSearchObject.programs.length > 0
  ) {
    return container.iSearchObject.programs;
  }
  return [];
}

function getMajorCampuses(container, asurite, user_info) {
  if (
    container.iSearchObject &&
    container.iSearchObject.majorCampuses &&
    container.iSearchObject.majorCampuses.length > 0
  ) {
    return container.iSearchObject.majorCampuses;
  }
  return [];
}

function getAsuriteId(container, asurite, user_info) {
  if (container.iSearchObject && container.iSearchObject.asuriteId) {
    return container.iSearchObject.asuriteId;
  }
  return asurite;
}

function getAffiliations(container, asurite, user_info) {
  if (
    container.iSearchObject &&
    container.iSearchObject.affiliations &&
    container.iSearchObject.affiliations.length > 0
  ) {
    return container.iSearchObject.affiliations;
  }
  return [];
}

function getDisplayName(container, asurite, user_info) {
  if (container.iSearchObject && container.iSearchObject.displayName) {
    return container.iSearchObject.displayName;
  }
  return "";
}

function getFirstName(container, asurite, user_info) {
  if (container.iSearchObject && container.iSearchObject.firstName) {
    return container.iSearchObject.firstName;
  }
  return "";
}

function getLastName(container, asurite, user_info) {
  if (container.iSearchObject && container.iSearchObject.lastName) {
    return container.iSearchObject.lastName;
  }
  return "";
}

function userFromResponse(container, asurite, user_info) {
  try {
    if (user_info) {
      return user_info;
    }
    return null;
  } catch (e) {
    return null;
  }
}

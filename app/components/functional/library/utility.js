import React from "react";
import { Text, View } from "react-native";
import moment from "moment";
import { responsiveWidth } from "react-native-responsive-dimensions";

const formatTime = (time) => {
  try {
    time = time
      .replace(":00", "")
      .replace("m", "")
      .replace(" ", "");
    return time;
  } catch (e) {
    return time;
  }
};

export const formatLabel = (index, data) => {
  switch (index) {
    case 0:
      return formatTime(data[index].time);
    case 3:
      return formatTime(data[index].time);
    case 6:
      return formatTime(data[index].time);
    case 9:
      return formatTime(data[index].time);
    case 12:
      return formatTime(data[index].time);
    case 15:
      return formatTime(data[index].time);
    case 18:
      return formatTime(data[index].time);
    case 21:
      return formatTime(data[index].time);
    default:
      return null;
  }
};

export const dowNum = (day) => {
  const dayArr = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayArr.indexOf(day);
};

export const libShortname = (activeLibrary) => {
  switch (activeLibrary.name) {
    case "Hayden Library - ASU Faculty, Staff and Students":
      return "Hayden Library";
    case "Polytechnic campus Library":
      return "Polytechnic Campus Library";
    case "Downtown campus Library - ASU Faculty, Staff and Students":
      return "Downtown - University Center";
    case "Design and the Arts Library":
      return "Design & Arts Library";
    case "Music Library":
      return "Music Library";
    case "West campus (Fletcher) Library":
      return "Fletcher Library";
    case "Noble Library - ASU Faculty, Staff and Students":
      return "Noble Library";
    default:
      return activeLibrary.name;
  }
};

export const renderRow = (option) => {
  return (
    <View
      style={{
        paddingVertical: responsiveWidth(3),
        marginHorizontal: responsiveWidth(2),
        justifyContent: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
      }}
    >
      <Text>{option}</Text>
    </View>
  );
};

export const xAxisData = (howBusyData) => {
  return howBusyData.map((item) => {
    svg: {
      fill: "#696969";
    }
  });
};

export const isLibActive = (library) => {
  if (
    [
      "Law Library",
      "Design and the Arts Library",
      "Downtown campus Library - ASU Faculty, Staff and Students",
      "West campus (Fletcher) Library",
      "Hayden Library - ASU Faculty, Staff and Students",
      "Music Library",
      "Noble Library - ASU Faculty, Staff and Students",
      "Polytechnic campus Library",
      "Thunderbird Library (IBIC)",
    ].includes(library)
  ) {
    return library;
  } else {
    return false;
  }
};

export const libHours = (activeLibrary) => {
  const now = moment().format("YYYY-MM-DD");
  let hours;
  Object.keys(activeLibrary.weeks[0]).forEach((day) => {
    if (activeLibrary.weeks[0][day].date === now) {
      hours = activeLibrary.weeks[0][day].rendered;
    }
  });
  return hours;
};

export const libHoursByKey = (activeLibrary, forceDay) => {
  const compareDate = moment(forceDay, "dddd - MMM Do").format("YYYY-MM-DD");
  const formattedForceDay = moment(forceDay, "dddd - MMM Do").format("dddd");
  if (compareDate === activeLibrary.weeks[0][formattedForceDay].date) {
    return activeLibrary.weeks[0][formattedForceDay].rendered;
  } else if (compareDate === activeLibrary.weeks[1][formattedForceDay].date) {
    return activeLibrary.weeks[1][formattedForceDay].rendered;
  } else {
    console.log(
      "There was a problem with dates matching for rendered library hours."
    );
  }
};

export const liveNowHours = (librarianChat) => {
  const now = moment().format("YYYY-MM-DD");
  let hours;
  let from;
  let to;
  librarianChat.weeks.forEach((week) => {
    Object.keys(week).forEach((day) => {
      if (week[day].date === now) {
        if (week[day].times.status == "closed") {
          hours = "closed";
          from = "closed";
          to = "closed";
        } else {
          hours = week[day].rendered;
          from = week[day].from;
          to = week[day].to;
        }
      }
    });
  });
  return {
    hours,
    from,
    to,
  };
};

export const libraryName = (library) => {
  switch (JSON.stringify(library.lid)) {
    // case "Armstrong Study Space":
    //   return "Armstrong Hall";
    // case "Downtown campus Library - ASU Faculty, Staff and Students":
    case "1292":
      return "Downtown Campus Library";
    // case "Hayden Library - ASU Faculty, Staff and Students":
    case "1290":
      return "Hayden Library";
    // case "Noble Library - ASU Faculty, Staff and Students":
    case "1295":
      return "Noble Library";
    // case "West campus (Fletcher) Library":
    case "1293":
      return "Fletcher Library";
    default:
      return library.name;
  }
};

export const libraryAddress = (string) => {
  if (!string || string === "") {
    return null;
  }

  const strippedHtml = string.replace(/<[^>]+>/g, "");
  const index = strippedHtml.indexOf("Phone")
    ? strippedHtml.indexOf("Phone")
    : 0;
  const result = {};
  const parsedText = strippedHtml.slice(0, index).split("Physical ");
  result.mailing = parsedText[0].replace("Mailing Address: ", "");
  result.physical = parsedText[1].replace("Address: ", "");

  return (
    <View style={{ flex: 1, alignItems: "flex-start" }}>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 0.3 }}>
          <Text style={{ fontWeight: "bold", fontFamily: "Roboto" }}>
            Mailing:
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#696969" }}>{result.mailing}</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 0.3 }}>
          <Text style={{ fontWeight: "bold", fontFamily: "Roboto" }}>
            Physical:
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#696969", alignSelf: "flex-start" }}>
            {result.physical}
          </Text>
        </View>
      </View>
    </View>
  );
};

export function getClosestLib(lat, lng, allLibs) {
  let minDif = 99999999;
  let closest = null;
  if (allLibs) {
    for (let i = 0; i < allLibs.length; ++i) {
      const dif = PythagorasEquirectangular(
        lat,
        lng,
        allLibs[i].lat,
        allLibs[i].long
      );
      if (dif < minDif) {
        closest = { name: allLibs[i].name, id: allLibs[i].lid };
        minDif = dif;
      }
    }
  }

  return closest;
}

function Deg2Rad(deg) {
  return (deg * Math.PI) / 180;
}

function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
  lat1 = Deg2Rad(lat1);
  lat2 = Deg2Rad(lat2);
  lon1 = Deg2Rad(lon1);
  lon2 = Deg2Rad(lon2);
  const R = 6371; // km
  const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  const y = lat2 - lat1;
  const d = Math.sqrt(x * x + y * y) * R;
  return d;
}

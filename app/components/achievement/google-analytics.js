import {
  GoogleAnalyticsTracker,
  GoogleAnalyticsSettings
} from "react-native-google-analytics-bridge";

const trackerNumber = "UA-42798992-11";
GoogleAnalyticsSettings.setDispatchInterval(30);
export const tracker = new GoogleAnalyticsTracker(trackerNumber);

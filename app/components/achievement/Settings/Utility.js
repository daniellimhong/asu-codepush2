import {
  Events
} from "../../functional/events/index";
import {
  News
} from "../../functional/news/index";
import {
  Schedule
} from "../../functional/schedule/";
import {
  Resources
} from "../Home/resources/Resources";
import {
  LCSection
} from "../LiveCards/LCSection";
import {
  Header
} from "../Header/Header";

const LC = [{
  title: "LC Section",
  data: [{
    component: LCSection,
    header: Header,
    props: {
      title: "Live Cards",
      color: "white",
      enabled: true,
      require_auth: false,
      locked: true
    }
  }]
}];

export const CFSources = [{
    Resources: {
      component: Resources,
      props: {
        title: "Resources",
        color: "grey",
        enabled: true,
        require_auth: false,
        locked: false,
        image: "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/home-sectionbg-schedule.png",
        previousScreen: "Home",
        previousSection: "live-cards-resources"
      }
    }
  },
  {
    Schedule: {
      component: Schedule,
      props: {
        title: "Schedule",
        color: "green",
        enabled: true,
        require_auth: true,
        locked: false,
        image: "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/home-sectionbg-schedule.png",
        previousScreen: "Home",
        previousSection: "live-cards-schedule"
      }
    }
  },
  {
    Events: {
      component: Events,
      props: {
        title: "Events",
        color: "#004F6B",
        enabled: true,
        require_auth: false,
        locked: false,
        image: "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/home-sectionbg-events.png",
        previousScreen: "Home",
        previousSection: "live-cards-events"
      }
    }
  },
  {
    News: {
      component: News,
      props: {
        title: "News",
        color: "#00BAEC",
        enabled: true,
        require_auth: false,
        locked: false,
        image: "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/home-sectionbg-news.png",
        previousScreen: "Home",
        previousSection: "live-cards-news"
      }
    }
  }
];

function formatCF(cfs, user) {
  let all = [];
  if (cfs.length) {
    cfs.forEach(item => {
      let key = Object.keys(item)[0];
      if (
        (item[key].props.require_auth && user !== "guest") ||
        !item[key].props.require_auth
      ) {
        let formatted = {};
        formatted.data = [item[key]];
        formatted.title = item[key].props.title;
        all.push(formatted);
      }
    });
  }
  return all;
}

export function computeCFRender(config, user) {
  let allItems = CFSources;
  let tmpKeys = [];
  let enabled = [];
  // Loop through and render preferred
  // Also simplify reference array of keys
  config.forEach(item => {
    let prefkey = Object.keys(item)[0];
    tmpKeys.push(prefkey);

    allItems.forEach(feature => {
      let featurekey = Object.keys(feature)[0];
      if (prefkey == featurekey && item[prefkey].props.enabled == true) {
        feature[featurekey].props = item[prefkey].props;
        enabled.push(feature);
      }
    });
  });

  // Loop through remaining items and push
  // if enabled by developer
  allItems.forEach(item => {
    let featurekey = Object.keys(item)[0];
    if (tmpKeys.indexOf(featurekey) < 0 && item[featurekey].props.enabled) {
      enabled.push(item);
    }
  });
  let LC = [
    {
      title: "LC Section",
      data: [
        {
          component: LCSection,
          header: Header,
          props: {
            title: "Live Cards",
            color: "white",
            enabled: true,
            require_auth: false,
            locked: true
          }
        }
      ]
    }
  ];

  return LC.concat(formatCF(enabled, user));
}
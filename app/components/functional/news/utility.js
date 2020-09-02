import { Api } from "../../../services";
import moment from "moment";
import axios from "axios";
import _ from "lodash";

/**
 * When the component updates, we compare the news props to the state
 * in order to decide whether we should update everything
 * @param {*} invoker
 */
export function shouldNewsRefresh(invoker) {
  try {
    let propsNews = invoker.props.news;
    let stateNews = invoker.state.section_data;

    if (stateNews.length <= 0 && propsNews.length > 0) {
      return true;
    } else if (propsNews.length <= 0) {
      return false;
    } else {
      let formattedPropsNews = formatEventForCFScroll(
        formatUniqueNews(propsNews)
      );
      return propsShouldRender(stateNews, formattedPropsNews);
    }
  } catch (e) {
    console.log(e);
  }
}

/**
 * Compare props with state. If props has new info then we return true
 * @param {*} stateNews
 * @param {*} propsNews
 */
function propsShouldRender(stateNews, propsNews) {
  // State may have a limit. Check to see that props is the same up to the limit
  if (stateNews.length < propsNews.length) {
    for (var i = 0; i < stateNews.length; i++) {
      let contains = propsNews.find(item => {
        return stateNews[i].key === item.key;
      });

      if (!contains) {
        return true;
      }
    }
  } else {
    for (var i = 0; i < propsNews.length; i++) {
      let contains = stateNews.find(item => {
        return propsNews[i].key === item.key;
      });

      if (!contains) {
        return true;
      }
    }
  }

  return false;
}

export function _pagerHandler(invoker, increment_val) {
  // changes the page state, refreshes content
  var page = invoker.state.page;

  page += increment_val;

  if (page < 0) {
    page = 0;
  } else {
    invoker.setState(
      {
        page: page,
        section_data: [],
        displayArray: []
      },
      () => {
        invoker._getData();
      }
    );
  }
}

export function _sectionDetailHandler(event_data, navigate) {
  // handles detail section navigation
  navigate("Event", { event: event_data });
}

export async function _getData(invoker) {
  // splitting url for url parameters
  var api_page = invoker.state.page ? invoker.state.page : 0;
  const api_endpoint =
    "https://asunow.asu.edu/api/now-topic-articles?page=" + api_page;
  if (!invoker.props.limit) {
    invoker.state.page = ++invoker.state.page;
  }
  const date_key = "event_start_date_machine";

  if (!invoker.state.processingPageLoad) {
    invoker.setState({
      processingPageLoad: true
    });
    invoker.context
      .getTokens()
      .then(tokens => {
        if (tokens.username && tokens.username !== "guest") {
          let payload = {
            page: api_page
          };
          let apiService = new Api(
            "https://y4p1n796vj.execute-api.us-west-2.amazonaws.com/prod",
            tokens
          );

          apiService
            .post("/interests", payload)
            .then(response => {
              storeNews(invoker, response, tokens.username);
            })
            .catch(error => {
              throw error;
            });
        } else {
          throw new Error("Unable to get personal feed as a guest");
        }
      })
      .catch(e => {
        axios
          .post(
            "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/guest",
            {
              page: api_page
            }
          )
          .then(response => storeNews(invoker, response));
      });
  }
}

export function formAlternatingList(input) {
  let displayArray = [];
  for (var j = input.length - 1; j >= 0; j--) {
    if (j % 3 === 0) {
      displayArray.unshift({
        displayType: "full",
        data: input[j]
      });
    } else {
      if (j % 3 == 2) {
        let k = j;
        displayArray.unshift({
          displayType: "half",
          data: [input[--j], input[k]]
        });
      } else {
        displayArray.unshift({
          displayType: "full",
          data: input[j]
        });
      }
    }
  }
  return displayArray;
}

function formatUniqueNews(news) {
  let newsList = [];
  for (var i = 0; i < news.length; i++) {
    newsList.push(news[i].node);
  }
  newsList = _.uniqBy(newsList, "field_original_url");

  return newsList;
}

export function storeNews(invoker, response, test = false) {
  let response_json;

  // restructure response, remove unnecessary nesting
  if (response && response.length > 0) {
    response_json = response;

    var section_data = [];
    var newsList = formatUniqueNews(response_json);
    // build formatted section data
    let formatted = formatEventForCFScroll(newsList);
    if (!invoker.props.limit) {
      section_data = _.uniqBy(
        invoker.state.section_data.concat(formatted),
        "title"
      );
    } else {
      section_data = _.uniqBy(formatted, "title");
    }
    // section_data =  _.sortBy(_.uniqBy(invoker.state.section_data.concat(formatted), 'title'), ['newsDate']).reverse();

    /**
     * If there is a data limit, apply it
     */
    if (invoker.props.limit) {
      section_data = section_data.slice(0, invoker.props.limit);
    }

    let displayArray = formAlternatingList(section_data);

    if (!test) {
      if (section_data.length > 0) {
        invoker.setState({
          section_data: section_data,
          processingPageLoad: false,
          displayArray: displayArray
        });
      }
    } else {
      return {
        section_data: section_data,
        displayArray: displayArray
      };
    }
  } else {
    invoker.setState({
      processingPageLoad: false,
      end: true
    });
  }
}

/**
 * Convert raw News data for use
 */
export function formatNews(item) {
  let format = {
    interests: item.field_interests ? item.field_interests : "",
    // type: 'news',
    feed_type: "news",
    key: item.field_original_url ? escape(item.field_original_url) : null,
    picture: item.field_hero_image_url
      ? item.field_hero_image_url
      : "https://s3-us-west-2.amazonaws.com/asu.mobile.app/images/asu_sunburst_600.png",
    title: item.title ? item.title : "",
    category: item.field_saf ? item.field_saf : "",
    description: item.body ? item.body : "",
    teaser: item.field_news_teaser ? item.field_news_teaser : "",
    url: item.field_original_url ? item.field_original_url : "",
    rawDate: item.field_imported_created ? item.field_imported_created : "",
    newsDate: moment(item.field_imported_created, "MMMDDYYYYhma").format(),
    ...item
  };

  return format;
}

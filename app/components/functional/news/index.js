import React, { Component } from "react";
import {
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Text
} from "react-native";
import _ from "lodash";
import Analytics from "./../analytics";
import { getNews } from "../../../Queries";
import { AppSyncComponent } from "../../functional/authentication/auth_components/appsync/AppSyncApp";
import { NewsPreview } from "./NewsPreview";
import { _getData, formatNews, shouldNewsRefresh } from "./utility";

import { ErrorWrapper } from "../error/ErrorWrapper";

class NewsX extends Component {
  page = 0;
  static defaultProps = {
    showHeader: null,
    client: {},
    limit: null,
    news: [],
    roles: null, // Provided roles determine whether we will display the Recommended
    navigationOverride: null,
    more: () => null,
    refresh: () => new Promise.resolve(),
    page: 0
  };

  componentDidMount() {
    // console.log("############# 222222 3 ",this.props);
    if(this.props.isHome){
      this.refs.analytics.sendData({
        "action-type": "view",
        "starting-screen": "Home",
        "starting-section": "news",
        "target": this.props.target?this.props.target:"News",
        "resulting-screen": "news-list",
        "resulting-section": null,
      });
    } else {
      // console.log("############# 222222 3 ",this.props.navigation.state.params.previousScreen, this.props.navigation.state.params.previousSection);
      this.refs.analytics.sendData({
        "action-type": "view",
        "starting-screen": (this.props.navigation.state.params && this.props.navigation.state.params.previousScreen)?
          this.props.navigation.state.params.previousScreen:null,
        "starting-section": (this.props.navigation.state.params && this.props.navigation.state.params.previousSection)?
          this.props.navigation.state.params.previousSection:null,
        "target": this.props.target?this.props.target:"News",
        "resulting-screen": "news-list",
        "resulting-section": null,
      });
    }
  }

  _loadMore = () => {
    this.props.loadMore({
      variables: {
        page: ++this.page
      },
      updateQuery: (prev, more) => {
        let res = {
          ...prev,
          getNews: [...prev.getNews]
        };

        let moreNews = _.get(more, "fetchMoreResult.getNews");
        if (Array.isArray(moreNews) && moreNews.length) {
          res.getNews = res.getNews.concat(moreNews);
          return res;
        }
      }
    });
  };

  _renderItem = ({ item, index }) => {
    formattedItem = formatNews(item.node);

    return (
      <View style={index % 5 === 0 ? { marginTop: 20 } : {}}>
        <NewsPreview
          key={formattedItem.key}
          itemIndex={index}
          navigation={this.props.navigation}
          data={formattedItem}
          displayType={"full"}
          previousScreen={this.props.isHome?this.props.previousScreen:
            ((this.props.navigation.state.params && this.props.navigation.state.params.previousScreen)?
            this.props.navigation.state.params.previousScreen:"Home")}
        />
      </View>
    );
  };

  _showEmptyListView = () => {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          flex: 1
          // backgroundColor: "black"
        }}
      >
        <View
          style={{
            marginVertical: 20
          }}
        >
          <ActivityIndicator size="large" animating={true} color="maroon" />
        </View>
      </View>
    );
  };

  render() {
    let { news, limit, navigation, roles, navigationOverride } = this.props;
    // If roles are provided for "Recommendations" but there is no response. Hide
    var self = this;
    if (
      (Array.isArray(roles) && !roles.length) ||
      (Array.isArray(roles) && roles.length && limit && !news.length)
    ) {
      return (
        <View>
          <Analytics ref="analytics" />
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <Analytics ref="analytics" />
        {this.props.showHeader}
        <FlatList
          style={{ backgroundColor: "white" }}
          data={limit && Array.isArray(news) ? news.slice(0, limit) : news}
          renderItem={this._renderItem}
          keyExtractor={item => {
            let formattedItem = formatNews(item.node);
            return formattedItem.key;
          }}
          ListEmptyComponent={this._showEmptyListView()}
          onEndReached={() => {
            limit ? null : this._loadMore();
          }}
          onEndReachedThreshold={0.3}
        />
        <View style={{ backgroundColor: "white" }}>
          {limit && news && news.length ? (
            <TouchableOpacity
              onPress={() => {
                // console.log("############# 222222 3 ",self.props.navigation.state.params.previousScreen, self.props.navigation.state.params.previousSection);
                if(self.props.isHome){
                  // console.log("############# 222222 isHome:",self.props.isHome, self.props.previousScreen, self.props.previousSection);
                  self.refs.analytics.sendData({
                    "action-type": "click",
                    "starting-screen": self.props.previousScreen?self.props.previousScreen:"Home",
                    "starting-section": self.props.previousSection?self.props.previousSection:null, 
                    "target":(roles && roles.length) ? "More Recommended" : "More ASU News",
                    "resulting-screen": navigationOverride ? navigationOverride : (roles && roles.length)?"recommended-news":"news-list",
                    "resulting-section": null,
                  });
                } else {
                  // console.log("############# 222222",self.props.navigation.state.params.previousScreen, self.props.navigation.state.params.previousSection);
                  self.refs.analytics.sendData({
                    "action-type": "click",
                    "starting-screen": (self.props.navigation.state.params && self.props.navigation.state.params.previousScreen)?
                    self.props.navigation.state.params.previousScreen:"Home",
                    "starting-section": (self.props.navigation.state.params && self.props.navigation.state.params.previousSection)?
                    self.props.navigation.state.params.previousSection:null,
                    "target":(roles && roles.length) ? "More Recommended" : "More ASU News",
                    "resulting-screen": navigationOverride ? navigationOverride : (roles && roles.length)?"recommended-news":"news-list",
                    "resulting-section": null,
                  });
                }
                roles && roles.length
                  ? navigation.navigate(
                      navigationOverride ? navigationOverride : "RecommendedNews",{
                        previousScreen:"recommended-news",
                        previousSection:" "
                        }
                    )
                  : navigation.navigate(
                      navigationOverride ? navigationOverride : "News",{
                        previousScreen:"news",
                        previousSection:" "
                      });
              }}
              accessible={true}
              accessibilityTraits="button"
              accessibilityComponentType="button"
            >
              <View
                style={{
                  marginVertical: 15,
                  alignSelf: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 200,
                  height: 40,
                  borderRadius: 30,
                  borderWidth: 1,
                  borderColor: "#D40546"
                }}
              >
                <Text
                  style={{ color: "#AE173C", fontSize: 15, fontWeight: "600", fontFamily: 'Roboto', }}
                >
                  {roles && roles.length ? "More Recommended" : "More ASU News"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }
}

const NewsContent = AppSyncComponent(NewsX, getNews);

export class News extends React.Component {
  render() {
    return (
      <ErrorWrapper>
        <NewsContent {...this.props} />
      </ErrorWrapper>
    );
  }
}

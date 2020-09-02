import React, { Component } from "react";
import EventsFilterContext from "./EventsFilterContext";

export default class EventsFilterProvider extends Component {
  state = {
    filter: "all",
    filterMenuOpen: false,
    showClubs: true,
    searchString: "",
    fetchingMore: false,
    getFilter: () => this.state.filter,
    changeFilter: newFilter => this.setState({ filter: newFilter }),
    toggleFilterMenu: () =>
      this.setState({ filterMenuOpen: !this.state.filterMenuOpen }),
    toggleShowClubs: () => this.setState({ showClubs: !this.state.showClubs }),
    setSearchText: text => this.setState({ searchString: text }),
    updateFetchingMore: boolean => this.setState({ fetchingMore: boolean })
  };

  render() {
    return (
      <EventsFilterContext.Provider value={this.state}>
        <React.Fragment>{this.props.children}</React.Fragment>
      </EventsFilterContext.Provider>
    );
  }
}

import React, { Component } from "react";
import Loading from "./Loading";
import classnames from "classnames";

class Dashboard extends Component {
  // We will show a Loading component when app is loading data
  // set up the initial loading state
  state = {
    loading: false,
  };

  render() {
    const dashboardClasses = classnames("dashboard");

    // Show the Loading component when the state is loading
    if (this.state.loading) {
      return <Loading />;
    }
    return <main className={dashboardClasses} />;
  }
}

export default Dashboard;

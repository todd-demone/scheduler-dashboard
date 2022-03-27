import React, { Component } from "react";
import Loading from "./Loading";
import Panel from "./Panel";
import classnames from "classnames";

const data = [
  {
    id: 1,
    label: "Total Interviews",
    value: 6,
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    value: "1pm",
  },
  {
    id: 3,
    label: "Most Popular Day",
    value: "Wednesday",
  },
  {
    id: 4,
    label: "Interviews Per Day",
    value: "2.3",
  },
];

class Dashboard extends Component {
  // We will show a Loading component when app is loading data
  // set up the initial loading state
  state = {
    loading: false,
    focused: null,
  };

  // Goal: when we click on a panel, the Dashboard shows only that panel
  // Steps:
  // 1. create 'setPanel(id)' that uses setState to set this.state.focused to panel.id
  // 2. pass selectPanel function to Panel component
  // 3.
  selectPanel(id) {
    this.setState({
      focused: id,
    });
  }

  render() {
    const dashboardClasses = classnames("dashboard", {
      // Include conditional CSS - use this class if dashboard is focused
      "dashboard--focused": this.state.focused,
    });

    // Show the Loading component when the state is loading
    if (this.state.loading) {
      return <Loading />;
    }

    const panels = data
      // If this.state.focused is equal to a panel id, then only show that panel
      // If null then show all panels
      .filter(
        (panel) =>
          this.state.focused === null || this.state.focused === panel.id
      )
      // create an array of Panel components
      .map((panel) => (
        <Panel
          key={panel.id}
          id={panel.id}
          label={panel.label}
          value={panel.value}
          // pass selectPanel to the Panel component
          onSelect={this.selectPanel}
        />
      ));

    return <main className={dashboardClasses}>{panels}</main>;
  }
}

export default Dashboard;

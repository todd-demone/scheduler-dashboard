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
  };

  render() {
    const dashboardClasses = classnames("dashboard");

    // Show the Loading component when the state is loading
    if (this.state.loading) {
      return <Loading />;
    }
    return (
      <main className={dashboardClasses}>
        {data.map((panel) => (
          <Panel
            key={panel.id}
            id={panel.id}
            label={panel.label}
            value={panel.value}
          />
        ))}
      </main>
    );
  }
}

export default Dashboard;

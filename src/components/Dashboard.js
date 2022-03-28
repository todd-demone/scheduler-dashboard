import React, { Component } from "react";
import axios from "axios";
import classnames from "classnames";
import Loading from "./Loading";
import Panel from "./Panel";
import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay,
} from "helpers/selectors";
import { setInterview } from "helpers/reducers";

// PANEL DATA STRUCTURE
const data = [
  {
    id: 1,
    label: "Total Interviews",
    // compute the value using a helper function and the state we load from the API
    getValue: getTotalInterviews,
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot,
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay,
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay,
  },
];

// CLASS
// We inherit behaviour from the React.Component class
class Dashboard extends Component {
  // STATE
  // notice we use the 'Class property' syntax to set up state
  // we don't use the constructor method
  state = {
    // We will show a Loading component when app is loading data
    // set up the initial loading state
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {},
  };

  // LIFECYCLE METHODS
  // Lifecycle methods let us handle side effects
  // Same goal as React Hooks API - ie useEffect()
  // React.Component provides the lifecycle methods
  // we can override them

  // 1. mount phase
  // happens once - when we create component instance
  // constructor(), render(), componentDidMount()

  // 2. update phase
  // component that is mounted can be updated 0 or more times
  // render(), componentDidUpdate()

  // 3. unmount phase
  // happens once
  // componentWillUnmount()

  componentDidMount() {
    // 1. Request data from the api server and merge it into the existing state object
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers"),
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data,
      });
    });

    // WEBSOCKET
    // step 1. connect to the scheduler-api WebSocket server
    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    // step 2. listen for WebSocket server messages and update state accordingly
    // when we hear a message that shows booking or cancelling an interview,
    // update the state using the setInterview helper
    this.socket.onmessage = (event) => {
      // convert string to JS data type
      const data = JSON.parse(event.data);

      // if the data is an object with the correct type, then update state
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState((previousState) =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };

    // LOCAL STORAGE
    // https://javascript.info/localstorage
    // check DevTools -> Application tab -> Local Storage

    // 2. Check LocalStorage for focus value
    // After we render for the first time, check to see if LocalStorage contains focus state
    // use JSON.parse to convert JSON string to JS object value
    const focused = JSON.parse(localStorage.getItem("focused"));

    // if LocalStorage has saved focus state, set the application's state to match it
    if (focused) {
      this.setState({ focused });
    }
  }

  // listen for changes to the focus state
  componentDidUpdate(previousProps, previousState) {
    // note that componentDidUpdate has access to props/state from the previous update
    // compare state from previous update to existing state
    // if state has changed then update LocalStorage
    if (previousState.focused !== this.state.focused) {
      // use JSON.stringify to convert JS object value to JSON string
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  componentWillUnmount() {
    // WEBSOCKET SERVER (CONTINUED)
    // step 2. close the WebSocket server when the component unmounts
    this.socket.close();
  }

  // EVENT HANDLER FOR CLICKS ON PANELS
  // Goal: when we click on a panel, the Dashboard shows only that panel
  // Steps:
  // 1. create 'setPanel(id)' instance method that uses setState to set this.state.focused to either null or panel.id
  // 2. pass an arrow function (that refers to selectPanel method) as a prop to the Panel component
  // 3. reference the prop in the onClick attribute in Panel

  // Option 0 (bug): instance method - we don't set 'this' as anything for setPanel
  // selectPanel(id) {
  //   // error/bug!
  //   // when the selectPanel function is invoked, selectPanel's 'this' is set as undefined
  //   // what we want is for the function to have its 'this' set to equal the instance of the Dashboard class
  //   // Right now, the browser can't 'see' setState.
  //   // all it sees is this.setState === undefined
  //   this.setState({
  //     focused: id,
  //   });
  // }

  // Option 1: use the constructor (and .bind() method) to set
  // the Dashboard instance as 'this' for the selectPanel() method
  // notice that this.selectPanel.bind(this) returns a new function that we assign to this.selectPanel
  // constructor(props) {
  //   super(props);
  //   this.selectPanel = this.selectPanel.bind(this);
  // }

  // Option 2: if no constructor (ie using class properties), then change selectPanel to an arrow function
  // arrow functions don't depend on where they are invoked to determine 'this'
  // arrow functions don't have a dynamic 'this' - ie it doesn't change based on where the fxn is invoked
  // for arrow functions, 'this' is based on where the function is declared
  // selectPanel = (id) => {
  //   this.setState({
  //     focused: id,
  //   });
  // };

  // Option 3 (recommended): use arrow function in render
  // change back to using instance method to define selectPanel

  /**
   * toggle between a multi-panel view and a single-panel (focused) view
   * @param {Number} id
   */
  selectPanel(id) {
    // pass a callback function to this.setState rather than an object
    // why? because it ensures that we are using the immediately previous state
    // the callback function must return an object to represent the new state
    // We never set state directly - instead we use the setState() method to modify state
    this.setState((previousState) => ({
      focused: previousState.focused !== null ? null : id,
    }));
  }

  // RENDER
  // We must define a render method in our class (override Component's render method)
  render() {
    const dashboardClasses = classnames("dashboard", {
      // Include conditional CSS - use this class if dashboard is focused
      // note - we access the instance's state using this.state
      "dashboard--focused": this.state.focused,
    });
    // Show the Loading component when the state is loading
    if (this.state.loading) {
      return <Loading />;
    }

    // PANELS ARRAY
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
          label={panel.label}
          // pass the Panel the return value of getValue(this.state)
          value={panel.getValue(this.state)}
          // Pass selectPanel to the Panel component
          // 'this' is defined as the Dashboard instance
          // because we use an arrow function here
          // For arrow functions, 'this' is equal to the surrounding object - ie the Dashboard instance
          onSelect={(event) => this.selectPanel(panel.id)}
        />
      ));

    return <main className={dashboardClasses}>{panels}</main>;
  }
}

export default Dashboard;

// HOW TO MAKE SURE 'THIS' IS REFERRING TO THE INTENDED OBJECT
// (IE, THE INSTANCE OF THE CLASS) WHEN YOU USE THE WORD 'THIS' INSIDE A FUNCTION

// 1. Use React.createClass (IGNORE - pre ES6 Classes)
// all functions are automatically bound to this
// just works -> onChange={this.handleChange}
// don't use this because React.createClass may become extinct

// ... when using ES6 Classes in React....

// 2. Bind in Render
// onChange={this.handleChange.bind(this)}
// may affect performance because function is reallocated on every render

// 3. Use Arrow Function in Render
// onChange={e => this.handleChange(e)}
// may affect performance

// 4. Bind in Constructor
// constructor(props) {
// super(props);
// this.handleChange = this.handleChange.bind(this);
// }

// 5. Use Arrow Function in Class Property
// handleChange = () => {
// call this function from render
// and this.whatever in here works fine
// }
// relies on Class Properties feature of JS
// also relies on fact that arrow functions automatically have context of their enclosing scope (ie are bound to their )
// ie. they don't change meaning of 'this'

// WHAT'S 'THIS'?
// it's a variable (binding) defined in the scope of every function
// ?? it's a way of implicitly passing along an object reference ??
// use 'this' instead of explicitly passing the object as a parameter
// this is defined when the function is called, not when the function is defined
// so it's a binding that's pointing to something during the execution of the function
// so a function can have a different 'this' every time it is called (b/c it depends on where it is called)
// look at the call-site (how the function is called) to find what this is
// (in call stack, call-site is invocation before currently executing function)

// it's not the function itself (ie it's not the function)
// it's not the function's lexical scope
//
// 'this' depends on the manner in which a function is called (invoked),
// not where a function is declared.
// ie. when a function is called, this is defined, and that definition
// depends on the call-site, i.e. where the function was called
// steps:
// 1. function called
// 2. a record is created (called activation record or execution context)
// - where the function was called on the call-stack
// - how the function was invoked
// - what parameters were passed
// - the function's 'this' reference, which is used for the rest of the function's execution

// YDKJS - Book 3 - this and Object Prototypes - Chapter 2
// look at the CALL-SITE to figure out what this is referring to
// when looking at call stack, the CALL-SITE is in the invocation before the currently executing function

// THIS - 4 RULES

// 1. Default Binding
// - non-strict mode: if foo() called unadorned in global context, then this points to global object
// - at the call-site, the call of foo() is unadorned
// if foo()'s contents are running in strict mode: this can't point to global object, so this is undefined

// 2. Implicit Binding
// function foo(){console.log(this.a)}
// const obj = {a: 2, foo: foo} // bind foo to obj by adding a key:value pair to obj (foo: foo)
// obj.foo()
// - at the call-site, the foo call is made with some context attached to it
// namely, obj. is attached to foo [ie, obj.foo()] so obj === this
// - only last level of object reference matters - so for obj1.obj2.foo(), this === obj2

// SOMETIMES A FUNCTION LOSES ITS IMPLICIT BINDING
// foo can lose its binding to obj and go back to default binding (global object or undefined)
// const bar = obj.foo; // bar is just a reference to foo itself, not obj.foo
// var a = 'oops global';
// bar() // 'oops global'

// 3. Explicit Binding
// implicit binding - add a key:value pair to obj (foo: foo)
// what if don't want to/can't add a key:value pair to obj?
// JS functions have access to these two methods:
// call(..) method
// apply(..) method
// 1st parameter - object to use for this
// then the method calls the function with that this specified
// eg foo.call(obj) // this === obj
// unfortunately, you can still lose the intended this binding, unless...

// Hard Binding (for explicit binding)
// you can do 'hard binding' to avoid losing your intended binding
// how to hard bind obj as this for foo:
// const bar = function() { foo.call( obj ) }
// bar.call( window ) // obj is still this for foo

// FUNCTION.PROTOTYPE.BIND() - A BUILT IN HARD-BINDING UTILITY (AS OF ES5)

import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import registerServiceWorker from "./registerServiceWorker";
import firebase from "./firebase";

import "semantic-ui-css/semantic.min.css";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter,
} from "react-router-dom";
import { createStore } from "redux";
import { Provider, connect } from "react-redux";
import rootReducer from "./reducers";
import { composeWithDevTools } from "redux-devtools-extension";
import { setUser, clearUser } from "./actions";
import Spinner from "./Spinner";
import ForgotPassword from "./components/Auth/ForgotPassword";
import VerifyEmail from "./components/Auth/VerifyEmail";

const store = createStore(rootReducer, composeWithDevTools());

class Root extends React.Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      // var user = firebase.auth().currentUser;
      if (user /*&& user.emailVerified */) {
        this.props.setUser(user);
        this.props.history.push("/");
        // } else if (user && !user.emailVerified) {
        //   this.props.setUser(user);
        //   this.props.history.push("/verify-email");
      } else {
        this.props.history.push("/login");
        this.props.clearUser();
      }
    });
  }

  render() {
    return this.props.isLoading ? (
      <Spinner />
    ) : (
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/verify-email" component={VerifyEmail} />
      </Switch>
    );
  }
}

const mapStateFromProps = (state) => ({
  isLoading: state.user.isLoading,
});

const RootWithAuth = withRouter(
  connect(mapStateFromProps, { setUser, clearUser })(Root)
);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();

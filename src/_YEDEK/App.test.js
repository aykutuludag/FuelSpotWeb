import React from 'react';
import {
    BrowserRouter as Router,
    Route,
    Link,
    Redirect,
    withRouter
} from "react-router-dom";
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';


////////////////////////////////////////////////////////////
// 1. Click the public page
// 2. Click the protected page
// 3. Log in
// 4. Click the back button, note the URL each time










const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true;
    setTimeout(cb, 100); // fake async
  },
  signout(cb) {
    this.isAuthenticated = false;
    setTimeout(cb, 100);
  }
};

const AuthButton = withRouter(
    ({ history }) =>
        fakeAuth.isAuthenticated ? (
            <p>
              Welcome!{" "}
              <button
                  onClick={() => {
                        fakeAuth.signout(() => history.push("/"));
                    }}
              >
                Sign out
              </button>
            </p>
        ) : (
            <p>You are not logged in.</p>
        )
);

function PrivateRoute({ component: Component, ...rest }) {
  return (
      <Route
          {...rest}
          render={props =>
                fakeAuth.isAuthenticated ? (
                  <Component {...props} />
                ) : (
                  <Redirect
                    to={{
                      pathname: "/",
                      state: { from: props.location }
                    }}
                  />
                )
              }
      />
  );
}



function Public() {
  return <h3>Public</h3>;
}

function Protected() {
  return <h3>Logged IN başarılı</h3>;
}













class Login extends React.Component {
  state = { redirectToReferrer: false };

  login = () => {
    fakeAuth.authenticate(() => {
      this.setState({ redirectToReferrer: true });
    });
  };

  render() {
    let { from } = this.props.location.state || { from: { pathname: "/" } };
    let { redirectToReferrer } = this.state;

    if (redirectToReferrer) return <Redirect to={'/protected'} />;

    return (
        <div>
          <p>You must log in to view the page at {from.pathname}</p>
          <button onClick={this.login}>Log in</button>
        </div>
    );
  }
}







class SimpleMap extends React.Component {


  var x = document.getElementById("mapinfo");

  function getLocation() {

}
  function showPosition(position) {
  var latlon = position.coords.latitude + "," + position.coords.longitude;

  var map;

  map = new google.maps.Map(document.getElementById('mapholder'), {
    center: {lat: position.coords.latitude, lng: position.coords.longitude},
    zoom: 8
  });

}
  getLocation();



  static defaultProps = {
    center: {
      lat: 59.95,
      lng: 30.33
    },
    zoom: 11
  };

  render() {
    return (
      // Important! Always set the container height explicitly
        <div style={{ height: '100vh', width: '100%' }}>
          <GoogleMapReact
              bootstrapURLKeys={{ key: Ph76g0MSZ2okeWQmShYDlXakjgjhbe }}
              defaultCenter={this.props.center}
              defaultZoom={this.props.zoom}
          >
            <AnyReactComponent
                lat={59.955413}
                lng={30.337844}
                text={'Kreyser Avrora'}
            />
          </GoogleMapReact>
        </div>
    );
  }
}














function AuthExample() {
  return (
      <Router>
        <div>
          <AuthButton />
          <ul>
            <li>
              <Link to="/public">Public Page</Link>
            </li>
            <li>
              <Link to="/protected">Protected Page</Link>
            </li>
          </ul>

          <Route exact path="/" component={Login} />
          <PrivateRoute path="/protected" component={Protected} />
        </div>
      </Router>
  );
}


export default AuthExample;







ReactDOM.render(<AuthExample />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

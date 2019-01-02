import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import {
    BrowserRouter as Router,
    Route,
    Link,
    NavLink,
    Redirect,
    withRouter,
    Switch
} from "react-router-dom";




import GoogleLogin from './../services/SocialLogins/GoogleLogin';


import { GetGeoCode } from '../services/GetGeoCode';
import { GetLatLng } from '../services/GetLatLng';


import FuelSpot_STATIONS from './Stations';
import FuelSpot_NEWS from './News';


import { store } from '../redux';




























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
              pathname: "/Login",
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
  return <h3>Protected</h3>;
}









class FuelSpot_LOGIN extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      redirectToReferrer: false,
      register: false
    };
  }


  login = () => {
    fakeAuth.authenticate(() => {
      this.setState({ redirectToReferrer: true });
    });
  };





  callBack = ( user ) => {
    this.getGeoCode( user[0] );
  };


  controlRegister = () => {

    localStorage.setItem("FUELSPOT_USER",JSON.stringify(this.state));


    if ( !this.state.user_FuelSpot.vehicles.length ) {
      console.log("Üye araç kaydı yapmamış");
      this.setState({ register: true });
    }




  };



  render() {


    let { from } = this.props.location.state || { from: { pathname: "/" } };
    let { redirectToReferrer } = this.state;

    if (redirectToReferrer) return <Redirect to={from} />;


    return (
        <div className="container-fluid d-flex h-100 p-0 mx-auto flex-column">
          <header className="masthead mb-auto">
            <div className="inner">
              <h3 className="masthead-brand">FuelSpot</h3>
            </div>
          </header>
          <main className="text-center">
            <div className="row no-gutters">
              <Switch>
                <Route exact path="/Login" component={FuelSpot_LoginWelcome} />
                <Route path="/Login/CarRegister" component={FuelSpot_CarRegister} />
                <Route component={FuelSpot_LoginWelcome}/>
              </Switch>
            </div>
          </main>
          <footer className="mastfoot mt-auto">
            <p>deneme</p>
          </footer>
        </div>
    );
  }
}










class FuelSpot_LoginWelcome extends React.Component {






  callBack = (FUELSPOT_USER) => {


    var _root = this;




    if (navigator.geolocation) {

      var lat_lng = navigator.geolocation.getCurrentPosition(function(position){

        var USER_POSITION = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        _root.getGeocodes(USER_POSITION);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }




    localStorage.setItem("FUELSPOT_USER",JSON.stringify(FUELSPOT_USER));

    this.props.history.push('/Login/CarRegister');
  };




  getGeocodes = (USER_POSITION) => {


    var geocoder = new window.google.maps.Geocoder;
    var latlng = {lat: parseFloat(USER_POSITION.lat), lng: parseFloat(USER_POSITION.lng)};

    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === 'OK') {
        if (results[0]) {

          var countries        = require('country-data').countries,
              currencies       = require('country-data').currencies,
              regions          = require('country-data').regions,
              languages        = require('country-data').languages,
              callingCountries = require('country-data').callingCountries;

          var USER_COUNTRY_SHORT_CODE = results[8].address_components[0].short_name;
          var USER_CURRENCIES_DATA = countries[USER_COUNTRY_SHORT_CODE].currencies[0];
          var USER_CURRENCIES = currencies[USER_CURRENCIES_DATA];
          var USER_UNIT;

          switch (USER_COUNTRY_SHORT_CODE) {
            // US GALLON COUNTRIES
            case "BZ":
            case "CO":
            case "DO":
            case "EC":
            case "GT":
            case "HN":
            case "HT":
            case "LR":
            case "MM":
            case "NI":
            case "PE":
            case "US":
            case "SV":
              USER_UNIT = "galon";
              break;
            // IMPERIAL GALLON COUNTRIES
            case "AI":
            case "AG":
            case "BS":
            case "DM":
            case "GD":
            case "KN":
            case "KY":
            case "LC":
            case "MS":
            case "VC":
            case "VG":
              USER_UNIT = "imperial_galon";
              break;
            default:
              // LITRE COUNTRIES. REST OF THE WORLD.
              USER_UNIT = "litre";
              break;
          }


          const url = "https://fuel-spot.com/api/other-tax.php";
          const body = "country=" + USER_COUNTRY_SHORT_CODE + "&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
          const params ={
            headers: {
              "content-type" : "application/x-www-form-urlencoded"
            },
            body: body,
            method: "POST"
          };

          fetch(url, params)
              .then(response => response.json())
              .then(
                  (USER_TAXES) => {

                    return [USER_COUNTRY_SHORT_CODE,USER_CURRENCIES,USER_UNIT,USER_TAXES[0]];
                  }
              )
              .catch(err => {
                console.error("Fetch hatası.", err)
              })




        } else {
          window.alert('Hata: Adres bilgisi alınamadı.');
        }
      } else {
        window.alert('Hata: Google geocoder hatası: ' + status);
      }
    });





  };



  getUserLocation = () => {

    var _root = this;

    if (!navigator.geolocation){
      window.alert("Hata: Tarayıcınız geolocation desteklemiyor");
      return;
    }

    function success(position) {
      console.log(position);
      return(position);
    }


    function error() {
      window.alert("Hata: Konum bilginiz elde edilemedi.");
    }

    navigator.geolocation.getCurrentPosition(success, error);


  };














  render() {

    return (

        <div className="col col-sm-6 mx-auto">
          <h1 className="text-white">Fuelspot Kullanabilmek için üye olmalısınız.</h1>
          <GoogleLogin cb={this.callBack} />
          <button className="btn btn-warning">Atla</button>
        </div>

    )
  }
}










class FuelSpot_CarRegister extends React.Component  {


  constructor(props) {
    super(props);
    this.state = {
      user: JSON.parse( localStorage.getItem("FUELSPOT_USER") ) || false
    };
  }

  render() {

    if ( !this.state.user[0] ) return <Redirect to="/Login" />;

    return (

        <div className="col col-sm-6 mx-auto">
          <form onSubmit={this.login} className="text-left">
            <div className="card">

              <div className="card-body">

                <div className="row">

                  <div className="col-4 text-center">
                    <img src={this.state.user[0].photo} className="card-img rounded-circle" />
                    <h4 className="mt-2">{this.state.user[0].name}</h4>
                  </div>

                  <div className="col-8">

                    <div className="p-4">

                      <div className="form-group">
                        <label>Araç Plakası</label>
                        <input name="name" type="text" className="form-control" placeholder="16 U 1320"/>
                      </div>

                      <div className="form-group">
                        <label>Araç KM Bilgisi</label>
                        <input name="kilometer" min="0" type="number" className="form-control" placeholder="24000"/>
                        <small id="emailHelp" class="form-text text-muted">Bilgileri kimseyle paylaşmayacağız.</small>
                      </div>

                      <div className="form-group">
                        <p className="m-0">Birincil yakıt</p>
                        <div className="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="exampleRadios" id="inlineCheckbox1" value="option1"/>
                          <label class="form-check-label" for="inlineCheckbox1">Benzin</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="exampleRadios" id="inlineCheckbox2" value="option2"/>
                          <label class="form-check-label" for="inlineCheckbox2">Dizel</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="exampleRadios" id="inlineCheckbox3" value="option3"/>
                          <label class="form-check-label" for="inlineCheckbox3">LPG</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="exampleRadios" id="inlineCheckbox3" value="option4"/>
                          <label class="form-check-label" for="inlineCheckbox3">Elektrik</label>
                        </div>
                      </div>

                      <div className="form-group">
                        <p className="m-0">İkincil yakıt</p>
                        <div className="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="exampleRadios2" value="option1"/>
                          <label class="form-check-label" for="inlineCheckbox1">Benzin</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="exampleRadios2" value="option2"/>
                          <label class="form-check-label" for="inlineCheckbox2">Dizel</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="exampleRadios2" value="option3"/>
                          <label class="form-check-label" for="inlineCheckbox3">LPG</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name="exampleRadios2" value="option4"/>
                          <label class="form-check-label" for="inlineCheckbox3">Elektrik</label>
                        </div>
                      </div>



                    </div>






                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" id="exampleCheck1"/>
                      <label class="form-check-label" for="exampleCheck1">Kullanım şartlarını ve üyelik anlaşmasını kabul ediyorum.</label>
                    </div>

                    <div class="form-check">
                      <input type="checkbox" class="form-check-input" id="exampleCheck1"/>
                      <label class="form-check-label" for="exampleCheck1">Veri kullandırma şartlarını şartlarını kabul ediyorum.</label>
                    </div>
                    <button className="btn btn-warning" type="submit" value="Submit">KAYDI TAMAMLA</button>
                  </div>

                </div>

              </div>

            </div>
          </form>
        </div>
    )
  }
}









class FuelSpot_HOME extends React.Component  {
  render() {
    return (
        <Router>
          <div className="container-fluid d-flex h-100 p-0 mx-auto flex-column">
            <header class="masthead mb-auto">
              <div class="inner">
                <h3 className="masthead-brand">FuelSpot</h3>

                <nav class="nav nav-masthead justify-content-start btn-group">
                  <NavLink exact={true} activeClassName='is-active' className="btn btn-fuelspot" to="/">İstasyonlar</NavLink>
                  <NavLink activeClassName='is-active' className="btn btn-fuelspot" to="/News">Güncel</NavLink>
                  <NavLink activeClassName='is-active' className="btn btn-fuelspot" to="/">Aracım</NavLink>
                  <NavLink activeClassName='is-active' className="btn btn-fuelspot" to="/">Profil</NavLink>
                  <NavLink activeClassName='is-active' className="btn btn-fuelspot" to="/">Ayarlar</NavLink>
                </nav>
              </div>
            </header>
            <main id="content">
              <Route exact path="/" component={FuelSpot_STATIONS} />
              <Route path="/News" component={FuelSpot_NEWS} />
            </main>

          </div>
        </Router>
    )
  }
}



















class Root extends React.Component {


  constructor(props) {
    super(props);
  }


  render() {

    return (
        <Provider store={store}>
          <Router>
            <Switch>
              <PrivateRoute exact path="/" component={FuelSpot_HOME}/>
              <Route path='/Login' component={FuelSpot_LOGIN}/>
              <Route component={FuelSpot_LOGIN}/>
            </Switch>
          </Router>
        </Provider>
    )
  }
}


Root.propTypes = {
  store: PropTypes.object.isRequired
};














export default Root;
import React, { Component } from 'react';
import ReactDOM from 'react-dom';



import { connect } from 'react-redux';
import { activateGeod } from './redux';

import {GoogleApiWrapper, Map, InfoWindow, Marker } from 'google-maps-react';

import IconRestaurant from './restaurant.svg';

var crg = require('country-reverse-geocoding').country_reverse_geocoding();


const mapStyles = {
  map: {
    width: '100%',
    height: '100%'
  }
};




export class MapContainer extends Component {


  constructor(props) {
    super(props);

    this.state = {
      initialPosition : {
        lat: null,
        lng: null
      },
      lat: null,
      lng: null,
      stations: []
    };

    this.fetchPlaces = this.fetchPlaces.bind(this);

  }


  componentDidMount() {

    var _root = this;
    var output = document.getElementById("out");

    if (!navigator.geolocation){
      output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
      return;
    }

    function success(position) {
      _root.setState({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        initialPosition: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      });
      output.innerHTML = '<p>Konumunuz ' + position.coords.latitude + '° ' + position.coords.longitude + '°</p>';
    }
    function error() {
      output.innerHTML = "Unable to retrieve your location";
    }




    output.innerHTML = "<p>Locating…</p>";

    navigator.geolocation.getCurrentPosition(success, error);




  }




  fetchPlaces(mapProps, map) {


    const {google} = mapProps;

    var cityCircle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.4,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.05,
      map: map,
      center: {lat: 39.9900087, lng: 32.652970499999995},
      radius: 2500
    });













    fetch("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=39.9900087,32.652970499999995&radius=2500&type=gas_station&key=AIzaSyApL2s7lB-bFleuq6inzkHkGvB-_l5ieXE")
        .then(response => response.json())
        .then(data => {
          this.stationsControl( data )
        })

  }



  stationsControl( data ) {


    var stations = data.results;

    for ( var i = 0; i < stations.length; i++ ) {

      var name = stations[i].name;
      var vicinity = stations[i].vicinity;
      var location = stations[i].geometry.location.lat + ';' + stations[i].geometry.location.lng;
      var country = crg.get_country(stations[i].geometry.location.lat, stations[i].geometry.location.lng);
      var countryCode = country.code; // TUR
      var googleID = stations[i].place_id;
      var photoURL;
      switch (name) {
        case "Akçagaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/akcagaz.jpg";
          break;
        case "Akpet":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/akpet.jpg";
          break;
        case "Alpet":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/alpet.jpg";
          break;
        case "Amaco":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/amaco.jpg";
          break;
        case "Anadolugaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/anadolugaz.jpg";
          break;
        case "Antoil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/antoil.jpg";
          break;
        case "Aygaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/aygaz.jpg";
          break;
        case "Aytemiz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/aytemiz.jpg";
          break;
        case "Best":
        case "Best Oil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/best.jpg";
          break;
        case "BP":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/bp.jpg";
          break;
        case "Bpet":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/bpet.jpg";
          break;
        case "Çekoil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/cekoil.jpg";
          break;
        case "Chevron":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/chevron.jpg";
          break;
        case "Circle-K":
        case "Circle K":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/circle-k.jpg";
          break;
        case "Citgo":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/citgo.jpg";
          break;
        case "Class":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/class.jpg";
          break;
        case "Damla Petrol":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/damla-petrol.jpg";
          break;
        case "Ecogaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/ecogaz.jpg";
          break;
        case "Energy":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/energy.jpg";
          break;
        case "Erk":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/erk.jpg";
          break;
        case "Euroil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/euroil.jpg";
          break;
        case "Exxon":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/exxon.jpg";
          break;
        case "GO":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/go.jpg";
          break;
        case "Gulf":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/gulf.jpg";
          break;
        case "Güneygaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/guneygaz.jpg";
          break;
        case "Güvenal Gaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/guvenalgaz.jpg";
          break;
        case "Habaş":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/habas.jpg";
          break;
        case "İpragaz":
        case "Ipragaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/ipragaz.jpg";
          break;
        case "Jetpet":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/jetpet.jpg";
          break;
        case "Kadoil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/kadoil.jpg";
          break;
        case "Kalegaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/kalegaz.jpg";
          break;
        case "Kalepet":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/kalepet.jpg";
          break;
        case "K-pet":
        case "Kpet":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/kpet.jpg";
          break;
        case "Lipetgaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/lipetgaz.jpg";
          break;
        case "Lukoil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/lukoil.jpg";
          break;
        case "Marathon":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/marathon.jpg";
          break;
        case "Milangaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/milangaz.jpg";
          break;
        case "Mobil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/mobil.jpg";
          break;
        case "Mogaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/mogaz.jpg";
          break;
        case "Moil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/moil.jpg";
          break;
        case "Mola":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/mola.jpg";
          break;
        case "Opet":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/opet.jpg";
          break;
        case "Pacific":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/pacific.jpg";
          break;
        case "Parkoil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/parkoil.jpg";
          break;
        case "Petline":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/petline.jpg";
          break;
        case "Petrol Ofisi":
        case "PO":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/petrol-ofisi.jpg";
          break;
        case "Petrotürk":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/petroturk.jpg";
          break;
        case "Powerwax":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/powerwax.jpg";
          break;
        case "Qplus":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/qplus.jpg";
          break;
        case "Quicktrip":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/quicktrip.jpg";
          break;
        case "Remoil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/remoil.jpg";
          break;
        case "Sanoil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/sanoil.jpg";
          break;
        case "Shell":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/shell.jpg";
          break;
        case "S Oil":
        case "S-Oil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/s-oil.jpg";
          break;
        case "Starpet":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/starpet.jpg";
          break;
        case "Sunoco":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/sunoco.jpg";
          break;
        case "Sunpet":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/sunpet.jpg";
          break;
        case "Teco":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/teco.jpg";
          break;
        case "Termo":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/termo.jpg";
          break;
        case "Texaco":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/texaco.jpg";
          break;
        case "Total":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/total.jpg";
          break;
        case "Türkiş":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/turkis.jpg";
          break;
        case "Türkiye Petrolleri":
        case "TP":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/turkiye-petrolleri.jpg";
          break;
        case "Türkoil":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/turkoil.jpg";
          break;
        case "Türkpetrol":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/turkpetrol.jpg";
          break;
        case "Turkuaz":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/turkuaz.jpg";
          break;
        case "United":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/united.jpg";
          break;
        case "Uspet":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/uspet.jpg";
          break;
        case "Valero":
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/valero.jpg";
          break;
        default:
          photoURL = "http://fuel-spot.com/FUELSPOTAPP/station_icons/unknown.jpg";
          break;
      }



      var FUELSPOTKEY = "Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
      var final = 'name='+ name + '&vicinity=' + vicinity + '&location=' + location + '&country=TR&googleID=' + googleID + '&logoURL=' + photoURL + '&AUTH_KEY=' + FUELSPOTKEY;
      var url = "http://fuel-spot.com/FUELSPOTAPP/api/station-add.php";



      var params ={
        headers: {
          "content-type" : "application/x-www-form-urlencoded"
        },
        body: final,
        method: "POST"
      };

      fetch(url, params)
          .then(res => res.json())
          .then(
              (result) => {
                this.setState(prevState => ({
                  stations: [...prevState.stations, result]
                }));
              },
              // Note: it's important to handle errors here
              // instead of a catch() block so that we don't swallow
              // exceptions from actual bugs in components.
              (error) => {
                console.log(error,"İstasyon FuelSpot'da kayıtlı değil. Görüntülenmeyecek.");
              }
          );



    }

  }





  onMarkerClick = (property, marker, e) => {


    this.setState({
      lat: property.position.lat,
      lng: property.position.lng
    });

    this.props.activateGeod({
      title: property.id
    });

  };





  recenterMap() {
    const map = this.map;
    const curr = this.state.currentLocation;

    const google = this.props.google;
    const maps = google.maps;

    if (map) {
      let center = new maps.LatLng(curr.lat, curr.lng);
      map.panTo(center)
    }
  }





  onMapClicked = (props) => {

    this.setState({
      showingInfoWindow: false,
      activeMarker: null
    })

  };


  render() {



    return (
        <Map
            google={this.props.google}
            onReady={this.fetchPlaces}
            ref="map"
            onClick={this.onMapClicked}
            zoom={14}
            disableDefaultUI={true}
            style={mapStyles}
            center={{
              lat: this.state.lat,
              lng: this.state.lng
            }}
        >

          <Marker
              key="self"
              position={{ lat: this.state.initialPosition.lat, lng: this.state.initialPosition.lng }}
              icon={{
                  url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
              }}
          />


          { this.state.stations.length ? this.state.stations.map((result, i) => (

              <Marker
                  key = { result[0].id }
                  id = { result[0].id }
                  onClick={ this.onMarkerClick }
                  position = {{ lat: result[0].location.split(";")[0], lng: result[0].location.split(";")[1] }}
              >
              </Marker>

          )) : null }

        </Map>
    );

  }
}



const LoadingContainer = (props) => (
    <div>Yükleniyor...</div>
);













// App.js
export class AppContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
        <React.Fragment key="app-container">
          <GoogleApiCont />
        </React.Fragment>
    );
  }
}
















// AppContainer.js
const mapStateToProps = state => ({
  geod: state.geod
});

const mapDispatchToProps = {
  activateGeod
};



const FuelSpotAppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(AppContainer);


const MapContainerConnect = connect(
    mapStateToProps,
    mapDispatchToProps
)(MapContainer);





const GoogleApiCont = GoogleApiWrapper({
  apiKey: "AIzaSyApL2s7lB-bFleuq6inzkHkGvB-_l5ieXE",
  LoadingContainer: LoadingContainer
})(MapContainerConnect);





export default FuelSpotAppContainer;
import React, { Component } from 'react';
import ReactDOM from 'react-dom';


import { connect } from 'react-redux';
import { activateGeod } from '../redux';
import { activateStation } from '../redux';

import {GoogleApiWrapper, Map, InfoWindow, Marker } from 'google-maps-react';

import ReactStreetview from 'react-streetview';


import { FuelSpotStationAdd } from '../services/FuelSpotStationAdd';

import IconRestaurant from '../restaurant.svg';

var crg = require('country-reverse-geocoding').country_reverse_geocoding();


const mapStyles = {
  map: {
    width: '100%',
    height: '100%'
  }
};





var _ = require('lodash');


export class MapContainer extends Component {


  constructor(props) {
    super(props);

    this.state = {
      initialPosition : {
        lat: null,
        lng: null
      },
      lat: null,
      lng: null
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
      //output.innerHTML = '<p>Konumunuz ' + position.coords.latitude + '° ' + position.coords.longitude + '°</p>';
      output.innerHTML = '';
    }
    function error() {
      output.innerHTML = "Unable to retrieve your location";
    }




    output.innerHTML = "<p>Konum verisi alınıyor</p>";

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



    this.map = map;


    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('out'), {
          position: {
            lat: 39.9900087,
            lng: 32.652970499999995},
          pov: {
            heading: 34,
            pitch: 10
          }
        });
    map.setStreetView(panorama);





    fetch("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=39.9900087,32.652970499999995&radius=3000&type=gas_station&key=AIzaSyApL2s7lB-bFleuq6inzkHkGvB-_l5ieXE")
        .then(response => response.json())
        .then(
            (googlePlaces) => {

              var stations = googlePlaces.results;

              for ( var i = 0; i < stations.length; i++ ) {

                const url = "http://fuel-spot.com/FUELSPOTAPP/api/station-add.php";
                const body = FuelSpotStationAdd(stations[i]);
                const params ={
                  headers: {
                    "content-type" : "application/x-www-form-urlencoded"
                  },
                  body: body,
                  method: "POST"
                };

                fetch(url, params)
                    .then(res => res.json())
                    .then(
                        (result) => {
                          //İstasyon görüntülenecek
                          this.addGlobalFuelSpotStations(result[0]);
                        },
                        (error) => {
                          console.log(error,"İstasyon FuelSpot'da kayıtlı değil. Görüntülenmeyecek.");
                        }
                    );
              }


            },
            (error) => {
              console.log(error,"Google Places Api'den veri alınamadı.");
            }
        )







  }



  addGlobalFuelSpotStations(station) {

    if ( !this.props.stations.all ) {
      this.props.stations.all = [];
    }

    var stations_array = this.props.stations.all;
    stations_array.push(station);

    this.props.activateStation({
      all: stations_array
    });



  }




  onMarkerClick = (property, marker, e) => {

    this.denemeactivateStation(property.id);

    const map = this.map;

    const google = property.google;
    const maps = google.maps;

    let center = new maps.LatLng(property.position.lat, property.position.lng);
    map.panTo(center);

  };



  denemeactivateStation = (id) => {

    this.props.activateGeod({
      active: id
    });


  };








  onMapClicked = (props) => {

    this.props.activateGeod({
      active: null
    });

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


          {
            this.props.stations.all ? this.props.stations.all.map((result, i) => (

              <Marker
                  key = { result.id }
                  id = { result.id }
                  //animation= { this.props.google.maps.Animation.DROP }
                  onClick={ this.onMarkerClick }
                  //icon={{
                  //  url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
                  //  anchor: new this.props.google.maps.Point(32,32),
                  //  scaledSize: new this.props.google.maps.Size(32,32)
                  //}}
                  position = {{ lat: result.location.split(";")[0], lng: result.location.split(";")[1] }}
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















export class ActiveStationView extends React.Component{

  constructor (props) {
    super(props);
    this.state = {
      station: props.station,
      campaigns: null,
      detailView: false
    };
    this.onOffDetails = this.onOffDetails.bind(this);
  }

  onOffDetails() {

    this.setState({detailView: !this.state.detailView});


    const url = "http://fuel-spot.com/FUELSPOTAPP/api/comment-fetch-station.php";
    const body = "stationID=" + this.state.station.id + "&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
    const params ={
      headers: {
        "content-type" : "application/x-www-form-urlencoded"
      },
      body: body,
      method: "POST"
    };

    fetch(url, params)
        .then(res => res.json())
        .then(
            (result) => {
              //İstasyon görüntülenecek
              console.log(result);
              this.setState({comments: result});
            },
            (error) => {
              console.log(error,"Yorum bulunamadı.");
            }
        );

    this.campaignFetch();




  };

  campaignFetch() {

    const url = "http://fuel-spot.com/FUELSPOTAPP/api/campaign-fetch.php";
    const body = "stationID=" + this.state.station.id + "&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
    const params ={
      headers: {
        "content-type" : "application/x-www-form-urlencoded"
      },
      body: body,
      method: "POST"
    };

    fetch(url, params)
        .then(res => res.json())
        .then(
            (result) => {
              //İstasyon görüntülenecek
              this.setState({campaigns: result});
            },
            (error) => {
              console.log(error,"Kampanya bulunamadı.");
            }
        );

  }






  render(){



    return(

        <div className="card station-card" id={this.state.station.id}>

          <div class="card-body">


            <div class="container-fluid">
              <div class="row">
                <div class="col-4 align-self-center">
                  <img className="card-img-top" src={this.state.station.logoURL}/>
                </div>
                <div class="col-8 p-0">
                  <table className="table table-striped">
                    <tbody>
                    <tr>
                      <th scope="col">Benzin</th>
                      <th scope="col">Dizel</th>
                      <th scope="col">LPG</th>
                    </tr>
                    </tbody>
                    <tbody>
                    <tr>
                      <td><h2>{this.state.station.gasolinePrice}</h2></td>
                      <td><h2>{this.state.station.dieselPrice}</h2></td>
                      <td><h2>{this.state.station.lpgPrice}</h2></td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>

          { this.state.detailView
              ?
              <div className="card-body station-card-detail">
                <div className="card-footer">
                  <button className="btn btn-block btn-fuelspot" onClick={() => this.onOffDetails()}>Kapat</button>
                </div>
                <div style={{
                        width: '100%',
                        height: '450px',
                        backgroundColor: '#eeeeee'
                }}>
                  <ReactStreetview
                      apiKey={"AIzaSyApL2s7lB-bFleuq6inzkHkGvB-_l5ieXE"}
                      streetViewPanoramaOptions={    {
                          position: {lat: Number(this.state.station.location.split(";")[0]), lng: Number(this.state.station.location.split(";")[1])},
                          pov: {heading: 100, pitch: 0},
                          zoom: 1,
                          disableDefaultUI: true
                        }}
                  />
                </div>

                { this.state.comments
                    ?
                    this.state.comments.map((item, i) => (
                        <div className="comment">
                          <div>
                           <h3>{item.username}</h3>
                            <p>{item.comment}</p>
                          </div>
                        </div>
                    ))
                    :
                    null
                }
              </div>
              :
              null
          }








          <div className="card-footer">
            <button className="btn btn-block btn-fuelspot" onClick={() => this.onOffDetails()}>İstasyon detay</button>
          </div>
        </div>
    );
  }

}
























export class FuelSpotStationView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };

  }

  render() {


    if ( this.props.stations.all ) {

      var lowestGas = _.minBy(this.props.stations.all, "gasolinePrice" );
      var highestGas = _.maxBy(this.props.stations.all, "gasolinePrice" );
      var lowestGasStation = lowestGas.gasolinePrice;
      var lowestGasStationName = lowestGas.name;
      var highestGasStation = highestGas.gasolinePrice;
      console.log(lowestGasStation.gasolinePrice)
    }

    if (this.props.geod.active) {
      var activeStati = _.filter(this.props.stations.all, {id: this.props.geod.active});
      var activeStation = activeStati[0];
    }

    return (
        <div id="fuel-spot-app">
          <div id="adet">

            <h3><span className="badge badge-warning badge-pill">{this.props.stations.all ? this.props.stations.all.length : "0"}</span> FuelSpot noktası bulundu.</h3>
            <p>Fatih Sultan Mehmet bulvarı adresindeki <span className="badge badge-primary badge-pill">{lowestGasStationName}</span>, benzin için <span className="badge badge-warning badge-pill">{lowestGasStation} tl</span>ile en iyi fiyatı veriyor.</p>
            <p className="high-benzin">En pahalı benzin: <span className="badge badge-danger badge-pill">{highestGasStation} tl</span></p>
          </div>

          { this.props.geod.active ? <ActiveStationView station={activeStation} key={activeStation.id}/> : null }

        </div>
    );
  }


}






// App.js
export class FuelSpot_STATIONS extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div id="STATIONS_API">
          <FuelSpotStationViewConnect />
          <GoogleApiCont />
      </div>
    );
  }
}
















// AppContainer.js
const mapStateToProps = state => ({
  geod: state.geod,
  stations: state.stations
});

const mapDispatchToProps = {
  activateGeod,
  activateStation
};






const FuelSpotStationViewConnect = connect(
    mapStateToProps,
    mapDispatchToProps
)(FuelSpotStationView);


const MapContainerConnect = connect(
    mapStateToProps,
    mapDispatchToProps
)(MapContainer);





const GoogleApiCont = GoogleApiWrapper({
  apiKey: "AIzaSyApL2s7lB-bFleuq6inzkHkGvB-_l5ieXE",
  LoadingContainer: LoadingContainer
})(MapContainerConnect);





export default FuelSpot_STATIONS;
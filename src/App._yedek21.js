import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {connect} from 'react-redux';
import {activateGeod} from './redux';


import {FuelSpotStationAdd} from './services/FuelSpotStationAdd';


import {GoogleApiWrapper, Marker} from 'google-maps-react';


var _ = require('lodash');


import IconRestaurant from './restaurant.svg';

var crg = require('country-reverse-geocoding').country_reverse_geocoding();


const mapStyles = {
    map: {
        width: '100%',
        height: '100%'
    }
};


const LoadingContainer = (props) => (
    <div>Yükleniyor...</div>
);


export class FuelSpotMapContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        if (!this.props.geod.title) {
            const view = [];
            this.props.geod.title = view;
        }
    }

    render() {
        const pos = {lat: 39.9900087, lng: 32.652970499999995};
        return (
            <div>
                <FuelSpotMap
                    google={this.props.google}
                    centerAroundCurrentLocation={true}
                >
                    <Marker
                        key="self"
                        position={pos}
                        icon={{
                            url: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
                        }}
                    />
                </FuelSpotMap>
            </div>
        )
    }
}


export class FuelSpotMap extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            currentLocation: {
                lat: 0,
                lng: 0
            }
        }
    }

    componentDidMount() {
        if (this.props.centerAroundCurrentLocation) {


            if (navigator && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const coords = pos.coords;

                    this.setState({
                        currentLocation: {
                            lat: coords.latitude,
                            lng: coords.longitude
                        }
                    })
                })
            }

            //Else Tarayıcınız lokasyon vermiyor

        }
        this.loadMap();
    }


    componentDidUpdate(prevProps, prevState) {
        if (prevProps.google !== this.props.google) {
            this.loadMap();
        }
        if (prevState.currentLocation !== this.state.currentLocation) {
            this.recenterMap();
        }
    }


    loadMap() {
        if (this.props && this.props.google) {
            // google is available
            const {google} = this.props;
            const maps = google.maps;

            const mapRef = this.refs.map;
            const node = ReactDOM.findDOMNode(mapRef);

            let zoom = 14;
            let lat = 39.9900087;
            let lng = 32.652970499999995;

            const center = new maps.LatLng(lat, lng);

            const mapConfig = Object.assign({}, {
                center: center,
                zoom: zoom
            });


            this.map = new maps.Map(node, mapConfig);

            const cityCircle = new maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.4,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.05,
                map: this.map,
                center: {lat: 39.9900087, lng: 32.652970499999995},
                radius: 2500
            });

            const url = "http://fuel-spot.com/FUELSPOTAPP/api/station-search.php";
            const body = "location=" + this.state.lat + ";" + this.state.lng + "&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
            const params = {
                headers: {
                    "content-type": "application/x-www-form-urlencoded"
                },
                body: body,
                method: "POST"
            };
            fetch(url, params)
                .then(res => res.json())
                .then(
                    (result) => {
                        //İstasyon görüntülenecek
                        this.storeValidStations(result);
                    },
                    (error) => {
                        console.log(error, "İstasyon FuelSpot'da kayıtlı değil. Görüntülenmeyecek.");
                    }
                );
        }
    }

    storeValidStations(station) {

    }


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


    render() {

        const style = {
            width: '100%',
            height: '100vh'
        };
        const pos = {lat: 39.9900087, lng: 32.652970499999995};

        return (
            <div ref="map" style={style}>
                Loading map...
            </div>
        )
    }


}


// AppContainer.js
const mapStateToProps = state => ({
    geod: state.geod
});

const mapDispatchToProps = {
    activateGeod
};


const FuelSpotMapContainerConnect = connect(
    mapStateToProps,
    mapDispatchToProps
)(FuelSpotMapContainer);


const FuelSpotMapConnect = connect(
    mapStateToProps,
    mapDispatchToProps
)(FuelSpotMap);


const GoogleApiCont = GoogleApiWrapper({
    apiKey: "AIzaSyApL2s7lB-bFleuq6inzkHkGvB-_l5ieXE",
    LoadingContainer: LoadingContainer
})(FuelSpotMapContainerConnect);


export class FuelSpotAppContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
        //if (!this.props.geod.title) {
        //  const view = [];
        //  this.props.geod.title = view;
        //}
    }

    render() {
        return (
            <React.Fragment key="app-container">
                <GoogleApiCont/>
            </React.Fragment>
        );
    }
}


const FuelSpotAppContainerConnect = connect(
    mapStateToProps,
    mapDispatchToProps
)(FuelSpotAppContainer);


export default FuelSpotAppContainerConnect;
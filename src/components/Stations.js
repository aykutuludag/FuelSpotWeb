import React, {Component} from 'react';

import {connect} from 'react-redux';
import {activateGeod, activateStation} from '../redux';

import {GoogleApiWrapper, Map, Marker} from 'google-maps-react';

import _ from 'lodash';


const mapStyles = {
    map: {
        width: '100%',
        height: '100%'
    }
};


export class MapContainer extends Component {
    onMarkerClick = (property, marker, e) => {
        this.openStationInfo(property.id);
        const {google} = this.props;
        const maps = google.maps;

        let center = new maps.LatLng(property.position.lat, property.position.lng);
        const map = property.map;
        map.panTo(center);
    };
    openStationInfo = (id) => {
        this.props.activateGeod({
            active: id
        });
    };
    onMapClicked = (props) => {
        this.props.activateGeod({
            active: null
        });

    };

    constructor(props) {
        super(props);
        this.state = {
            vehicles: false
        };
    }

    static onMapReady(mapProps, map) {
        const {google} = mapProps;
        var cityCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.4,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.05,
            map: map,
            center: {lat: this.lat, lng: this.lng},
            radius: 2500
        });
    }

    componentDidMount() {
        var _root = this;
        var output = document.getElementById("out");

        if (!navigator.geolocation) {
            output.innerHTML = "<p>Tarayıcınız geolocation desteklemiyor.</p>";
            return;
        }

        function success(position) {
            _root.setState({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                },
                () => {
                    console.log("1. Koordinat bulundu, FuelSpot Api çalıştırılacak.", _root.state);
                    if (!_root.props.stations.all) {
                        _root.fetchPlaces();
                    }

                }
            );
            output.innerHTML = '';
        }

        function error() {
            output.innerHTML = "Konum bilginiz elde edilemedi. FuelSpot Google Maps çalışmayacak.";
        }


        output.innerHTML = "<p>Konum bilginiz alınıyor...</p>";

        navigator.geolocation.getCurrentPosition(success, error);
    }

    fetchPlaces() {
        const url = "https://fuel-spot.com/api/station-search.php";
        const body = "location=" + this.state.lat + ";" + this.state.lng + "&radius=2500&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
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
                    console.log(result);
                    for (var i = 0; i < result.length; i++) {
                        this.addGlobalFuelSpotStations(result[i]);
                    }
                },
                (error) => {
                    console.log(error, "İstasyon FuelSpot'da kayıtlı değil. Görüntülenmeyecek.");
                }
            );
    }

    addGlobalFuelSpotStations(station) {

        if (!this.props.stations.all) {
            this.props.stations.all = [];
        }

        var stations_array = this.props.stations.all;
        stations_array.push(station);

        var lowestGas = _.minBy(stations_array, "gasolinePrice");
        var highestGas = _.maxBy(stations_array, "gasolinePrice");

        var lowestGasStationName = lowestGas.name;
        var lowestGasStationId = lowestGas.id;
        var lowestGasStationPrice = lowestGas.gasolinePrice;

        var highestGasStationName = lowestGas.name;
        var highestGasStationId = lowestGas.id;
        var highestGasStationPrice = lowestGas.gasolinePrice;


        this.props.activateStation({
            all: stations_array,
            lStation: lowestGasStationId
        });


    }

    render() {
        return (
            <Map
                google={this.props.google}
                onReady={MapContainer.onMapReady}
                ref="map"
                onClick={this.onMapClicked}
                zoom={13}
                disableDefaultUI={true}
                style={mapStyles}
                center={{
                    lat: this.state.lat,
                    lng: this.state.lng
                }}
            >

                <Marker
                    key="self"
                    position={{lat: this.state.lat, lng: this.state.lng}}
                    icon={{
                        url: "https://www.fuel-spot.com/default_icons/fuel-spot-station-icon-current-location.png"
                    }}/>


                {
                    this.props.stations.all ? this.props.stations.all.map((result, i) => (

                        <Marker
                            key={result.id}
                            id={result.id}
                            onClick={this.onMarkerClick}
                            icon={this.props.stations.lStation == result.id ? "https://www.fuel-spot.com/default_icons/fuel-spot-station-icon-star.png" : "https://www.fuel-spot.com/default_icons/fuel-spot-station-icon-s.png"}
                            animation={this.props.stations.lStation == result.id ? this.props.google.maps.Animation.BOUNCE : null}
                            position={{lat: result.location.split(";")[0], lng: result.location.split(";")[1]}}
                        >
                        </Marker>

                    )) : null}

            </Map>
        );

    }
}


const LoadingContainer = (props) => (
    <div>Yükleniyor...</div>
);


export class IFrame extends React.Component {

    loadData = (url) => {

        console.log("girdi.");
        fetch(url)
            .then(function (response) {
                // console.log(url + " -> " + response.ok);
                if (response.ok) {
                    return response.text();
                }
                throw new Error('Error message.');
            })
            .then(function (data) {
                console.log("data: ", data);
                this.setState({content: data});
            }.bind(this))
            .catch(function (err) {
                console.log("failed to load ", url, err.message);
            });
    };

    constructor(props) {

        super(props);

        this.loadData("https://www.google.com/maps?cbll=-36.0851437761,146.917419491&cbp=12,90,0,0,5&layer=c");
    }

    iframe() {
        return {
            __html: this.props.iframe
        }
    };

    render() {
        return (
            <div>
                <div dangerouslySetInnerHTML={{__html: this.content || null}}/>
            </div>
        );
    }
}


const iframe = '<iframe src="https://www.google.com/maps/@39.9815725,32.6579814,3a,75y,259.16h,90t/data=!3m5!1e1!3m3!1siBpRPHkzwZ3FvRWfJFquzg!2e0!6s%2F%2Fgeo3.ggpht.com%2Fcbk%3Fpanoid%3DiBpRPHkzwZ3FvRWfJFquzg%26output%3Dthumbnail%26cb_client%3Dsearch.TACTILE.gps%26thumb%3D2%26w%3D96%26h%3D64%26yaw%3D259.1622%26pitch%3D0%26thumbfov%3D100" width="100%" height="450"></iframe>';


export class ActiveStationView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            station: props.station,
            detailView: false
        };
        this.onOffDetails = this.onOffDetails.bind(this);
    }

    onOffDetails() {

        const url = "https://fuel-spot.com/api/comment-fetch-station.php";
        const body = "stationID=" + this.state.station.id + "&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
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
                    //Yorum bulundu
                    console.log(result);
                    this.setState({comments: result});
                },
                (error) => {
                    console.log(error, "Yorum bulunamadı.");
                }
            );

        this.campaignFetch();

    };

    campaignFetch() {

        const url = "https://fuel-spot.com/api/campaign-fetch.php";
        const body = "stationID=" + this.state.station.id + "&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
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
                    //Kampanya bulundu
                    this.setState({campaigns: result});
                },
                (error) => {
                    console.log(error, "Kampanya bulunamadı.");
                }
            );

        this.setState({detailView: !this.state.detailView});

    }


    render() {
        return (
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

                <div className="card-body station-card-detail">
                    <div style={{
                        width: '100%',
                        height: '250px',
                        backgroundColor: '#eeeeee'
                    }}>


                        <IFrame/>


                    </div>
                </div>


                {this.state.detailView
                    ?
                    <div className="card-body station-card-detail">

                        {this.state.comments
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
                    <button className="btn btn-block btn-fuelspot" onClick={() => this.onOffDetails()}>İstasyon detay
                    </button>
                </div>
            </div>
        );
    }

}


export class FuelSpotStationView extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {


        if (this.props.stations.all) {

            var lowestGas = _.minBy(this.props.stations.all, "gasolinePrice");
            var highestGas = _.maxBy(this.props.stations.all, "gasolinePrice");

            var lowestGasStationName = lowestGas.name;
            var lowestGasStationVicinity = lowestGas.vicinity;
            var lowestGasStationPrice = lowestGas.gasolinePrice;
            var highestGasStationPrice = highestGas.gasolinePrice;

        }

        if (this.props.geod.active) {
            var activeStati = _.filter(this.props.stations.all, {id: this.props.geod.active});
            var activeStation = activeStati[0];
        }

        return (
            <div id="fuel-spot-app">
                <div id="informations">

                    <h3><span
                        className="badge badge-warning badge-pill">{this.props.stations.all ? this.props.stations.all.length : "0"}</span> FuelSpot
                        noktası bulundu.</h3>
                    <p>{lowestGasStationVicinity || null} adresindeki <span
                        className="badge badge-primary badge-pill">{lowestGasStationName}</span>, benzin için <span
                        className="badge badge-warning badge-pill">{lowestGasStationPrice} tl</span>ile en iyi fiyatı
                        veriyor.</p>
                    <p className="high-benzin">En pahalı benzin: <span
                        className="badge badge-danger badge-pill">{highestGasStationPrice} tl</span></p>
                </div>

                {this.props.geod.active ? <ActiveStationView station={activeStation} key={activeStation.id}/> : null}

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

                <FuelSpotStationViewConnect/>
                <GoogleApiCont/>
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
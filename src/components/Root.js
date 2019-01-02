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


import _ from 'lodash';



import GoogleLogin from './../services/SocialLogins/GoogleLogin';
import FacebookLogin from './../services/SocialLogins/FacebookLogin';


import { GetLatLng } from '../services/GetLatLng';
import { GetGeoCode } from '../services/GetGeoCode';


import FuelSpot_STATIONS from './Stations';
import FuelSpot_NEWS from './News';
import FuelSpot_VEHICLES from './Vehicles';
import FuelSpot_PROFILE from './Profile';


import { store } from '../redux';



import {GoogleApiWrapper, Map, Marker } from 'google-maps-react';


import { FuelSpotStationAdd } from '../services/FuelSpotStationAdd';



const AUTH_KEY = "AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";








const mapStyles = {
    width: '100%',
    height: '100%'
};








class StationMapContainer extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            station: false
        };

    }


    componentDidMount() {

        var _root = this;
        var output = document.getElementById("out");

        if (!navigator.geolocation){
            output.innerHTML = "<p>Tarayıcınız geolocation desteklemiyor.</p>";
            return;
        }

        function success(position) {
            _root.setState({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                },
                () => {
                    console.log("1. Koordinat bulundu, FuelSpot Api çalıştırılacak.", _root.state);

                    if ( !_root.props.station ) {
                        _root.fetchPlaces()
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



    onMapReady(mapProps, map) {

        const {google} = mapProps;

        var cityCircle = new google.maps.Circle({
            strokeColor: '#FF0000',
            strokeOpacity: 0.4,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.05,
            map: map,
            center: {lat: 39.9900087, lng: 32.652970499999995},
            radius: 50
        });




    }



    fetchPlaces() {

        const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+ 39.99141 +","+ 32.63479 +"&radius=50&type=gas_station&key=AIzaSyApL2s7lB-bFleuq6inzkHkGvB-_l5ieXE";
        const params ={
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
            },
            method: "POST"
        };

        fetch(url,params)
            .then(response => response.json())
            .then(
                (googlePlaces) => {

                    var stations = googlePlaces.results;
                    console.log(stations);

                        const url = "https://fuel-spot.com/api/station-add.php";
                        const body = FuelSpotStationAdd(stations[0]);
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

                                    this.addGlobalFuelSpotStations(result[0]);

                                },
                                (error) => {
                                    console.log(error,"İstasyon FuelSpot'da kayıtlı değil.");
                                }
                            );



                },
                (error) => {
                    console.log(error,"Google Places Api'den veri alınamadı.");
                }
            )


    }


    addGlobalFuelSpotStations(station) {
        this.setState({
           station: station
        });
        console.log(station);
    }






    onMarkerClick = (property, marker, e) => {

        this.openStationInfo(property.id);
        const {google} = this.props;
        const maps = google.maps;

        let center = new maps.LatLng(property.position.lat, property.position.lng);
        const map = property.map;
        map.panTo(center);
    };




    render() {


        return (
            <Map
                google={this.props.google}
                onReady={this.onMapReady}
                ref="map"
                zoom={18}
                disableDefaultUI={true}
                style={mapStyles}
                center={{
                    lat: this.state.lat,
                    lng: this.state.lng
                }}
            >

                <Marker
                    key="self"
                    position={{ lat: this.state.lat, lng: this.state.lng }}
                    icon={{
                        url: "https://www.fuel-spot.com/default_icons/fuel-spot-station-icon-current-location.png"
                   }}
                />


            </Map>
        );

    }
}



const LoadingContainer = (props) => (
    <div>Yükleniyor...</div>
);




const GoogleApiCont = GoogleApiWrapper({
    apiKey: "AIzaSyApL2s7lB-bFleuq6inzkHkGvB-_l5ieXE",
    LoadingContainer: LoadingContainer
})(StationMapContainer);















const fakeAuth = {
    isAuthenticated: JSON.parse( localStorage.getItem("FUELSPOT_USER") ) ? true : false,
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
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }
        />
    );
}











class FuelSpot_PUBLIC extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            redirectToReferrer: fakeAuth.isAuthenticated,
            register: false
        };
        console.log(this)
    }


    login = () => {
        fakeAuth.authenticate(() => {
            this.setState({ redirectToReferrer: true });
        });
    };


    render() {

        let { from } = { from: { pathname: "/" } };
        let { redirectToReferrer } = this.state;

        if (redirectToReferrer) return <Redirect to={from} />;

        return (
            <Router>
                <div className="container-fluid d-flex h-100 p-0 mx-auto flex-column fuel-spot-bg">
                    <header className="masthead mb-auto">
                        <div className="inner">
                            <h3 className="masthead-brand">FuelSpot</h3>
                        </div>
                    </header>
                    <main className="text-center">
                        <div className="row no-gutters">
                            <Switch>
                                <Route
                                    exact path="/login"
                                    render={() => <FuelSpot_LoginAndCarRegister login={this.login}  />}
                                />
                                <Route path="/privacy" component={FuelSpot_PRIVACY} />
                                <Route path="/termsandconditions" component={FuelSpot_TERMSANDCONDITIONS} />
                            </Switch>
                        </div>
                    </main>
                    <footer className="mastfoot mt-auto">
                        <nav class="nav nav-masthead justify-content-start btn-group">
                            <NavLink exact={true} activeClassName='is-active' className="btn btn-fuelspot" to="/login">Giriş</NavLink>
                            <NavLink activeClassName='is-active' className="btn btn-fuelspot" to="/privacy">Gizlilik</NavLink>
                            <NavLink activeClassName='is-active' className="btn btn-fuelspot" to="/termsandconditions">Kullanım Şartları</NavLink>
                        </nav>
                    </footer>
                </div>
            </Router>
        );
    }
}
















class FuelSpot_TERMSANDCONDITIONS extends React.Component {

    render() {
        return (
            <div className="col col-sm-6 mx-auto text-white">
                <h1>Terms and Conditions</h1>
                <p>

                    Introduction
                    These Website Standard Terms and Conditions written on this webpage shall manage your use of our website, Webiste Name accessible at Website.com.

                    These Terms will be applied fully and affect to your use of this Website. By using this Website, you agreed to accept all terms and conditions written in here. You must not use this Website if you disagree with any of these Website Standard Terms and Conditions.

                    Minors or people below 18 years old are not allowed to use this Website.

                    Intellectual Property Rights
                    Other than the content you own, under these Terms, FuelSpot and/or its licensors own all the intellectual property rights and materials contained in this Website.

                    You are granted limited license only for purposes of viewing the material contained on this Website.

                    Restrictions
                    You are specifically restricted from all of the following:

                    publishing any Website material in any other media;
                    selling, sublicensing and/or otherwise commercializing any Website material;
                    publicly performing and/or showing any Website material;
                    using this Website in any way that is or may be damaging to this Website;
                    using this Website in any way that impacts user access to this Website;
                    using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity;
                    engaging in any data mining, data harvesting, data extracting or any other similar activity in relation to this Website;
                    using this Website to engage in any advertising or marketing.
                    Certain areas of this Website are restricted from being access by you and FuelSpot may further restrict access by you to any areas of this Website, at any time, in absolute discretion. Any user ID and password you may have for this Website are confidential and you must maintain confidentiality as well.

                    Your Content
                    In these Website Standard Terms and Conditions, “Your Content” shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant FuelSpot a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.

                    Your Content must be your own and must not be invading any third-party's rights. FuelSpot reserves the right to remove any of Your Content from this Website at any time without notice.

                    No warranties
                    This Website is provided “as is,” with all faults, and FuelSpot express no representations or warranties, of any kind related to this Website or the materials contained on this Website. Also, nothing contained on this Website shall be interpreted as advising you.

                    Limitation of liability
                    In no event shall FuelSpot, nor any of its officers, directors and employees, shall be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract.  FuelSpot, including its officers, directors and employees shall not be held liable for any indirect, consequential or special liability arising out of or in any way related to your use of this Website.

                    Indemnification
                    You hereby indemnify to the fullest extent FuelSpot from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.

                    Severability
                    If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.

                    Variation of Terms
                    FuelSpot is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis.

                    Assignment
                    The FuelSpot is allowed to assign, transfer, and subcontract its rights and/or obligations under these Terms without any notification. However, you are not allowed to assign, transfer, or subcontract any of your rights and/or obligations under these Terms.

                    Entire Agreement
                    These Terms constitute the entire agreement between FuelSpot and you in relation to your use of this Website, and supersede all prior agreements and understandings.

                    Governing Law & Jurisdiction
                    These Terms will be governed by and interpreted in accordance with the laws of the State of Country, and you submit to the non-exclusive jurisdiction of the state and federal courts located in Country for the resolution of any disputes.
                </p>
            </div>
        )
    }

}















class FuelSpot_LoginAndCarRegister extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userType: "REGULAR_USER",
            carRegister: false,
            stationRegister: false
        };
        this.callBack = this.callBack.bind(this);
    }



    componentWillMount() {

        const FUELSPOT_STORAGE = JSON.parse( localStorage.getItem("FUELSPOT_USER") ) || false;


        if ( FUELSPOT_STORAGE ) {

            if ( FUELSPOT_STORAGE.user.vehicles ) {

                if ( FUELSPOT_STORAGE.user.vehicles == "" ) {

                    console.log("Üye araç kaydı yapmamış");
                    this.setState({
                        carRegister: true
                    });
                } else {

                    // Get user car
                    //
                    var url  = 'https://fuel-spot.com/api/automobile-fetch.php';
                    var paramMendatory = 'vehicleID=' + FUELSPOT_STORAGE.user.vehicles.replace(';','') + '&' + AUTH_KEY;

                    var params ={
                        headers: {
                            "content-type" : "application/x-www-form-urlencoded"
                        },
                        body:  paramMendatory,
                        method: "POST"
                    };

                    fetch(url, params)
                        .then(res => res.json())
                        .then(
                            (result) => {

                                FUELSPOT_STORAGE.user.vehicles = result;
                                localStorage.setItem("FUELSPOT_USER",JSON.stringify(FUELSPOT_STORAGE));
                                this.props.login();

                                document.body.classList.remove("loading");
                            },
                            (error) => {
                                alert("Kullanıcı aracı api'den çekilemedi!");
                                console.log(error);
                            }
                        );


                }



            } else {

                if ( FUELSPOT_STORAGE.user.stations == "" ) {

                    console.log("Üye istasyon kaydı yapmamış");
                    this.setState({
                        stationRegister: true
                    });

                } else {

                    this.props.login();
                }

            }





        }
    };






    async callBack(FUELSPOT_USER){

        const position = await GetLatLng();
        const geocode = await GetGeoCode(position);

        const FUELSPOT_STORAGE = {
            user: FUELSPOT_USER[0],
            position: [ position.coords.latitude, position.coords.longitude ],
            geocode: geocode
        };

        localStorage.setItem("FUELSPOT_USER",JSON.stringify(FUELSPOT_STORAGE));


        if ( FUELSPOT_STORAGE.user.vehicles ) {

            if ( FUELSPOT_STORAGE.user.vehicles == "" ) {

                console.log("Üye araç kaydı yapmamış");
                this.setState({
                    carRegister: true
                });

            } else {

                this.props.login();
            }

        } else {

            if ( FUELSPOT_STORAGE.user.stations == "" ) {

                console.log("Üye istasyon kaydı yapmamış");
                this.setState({
                    stationRegister: true
                });

            } else {

                this.props.login();
            }



        }



    };





    superUser = () => {
        this.setState({
            userType: "SUPER_USER"
        });
    };


    render() {

        if ( this.state.carRegister ) {
            return (
                <div className="col col-sm-6 mx-auto">
                    <FuelSpot_CarRegister cb={this.props.login} />
                </div>
            )
        }

        if ( this.state.stationRegister ) {
            return (
                <div className="col col-sm-6 mx-auto">
                    <FuelSpot_StationRegister cb={this.props.login} />
                </div>
            )
        }

        return (
            <div className="col col-sm-6 mx-auto login-buttons">
                <h1 className="text-white">Fuelspot Kullanabilmek için üye olmalısınız.</h1>
                <div className="btn-group-lg btn-group-vertical">
                    <GoogleLogin cb={this.callBack} userType={this.state.userType} />
                    <FacebookLogin />
                    <button className="btn btn-warning" onClick={this.superUser}>İstasyon Kaydı</button>
                </div>
            </div>
        )




    }


}














class FuelSpot_StationRegister extends React.Component  {


    constructor(props) {
        super(props);
        this.state = {
            user: JSON.parse( localStorage.getItem("FUELSPOT_USER") ).user || false,
            userGeocode : JSON.parse( localStorage.getItem("FUELSPOT_USER") ).geocode || false
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.submit = this.submit.bind(this);
    }




    fetchAutoModels = () => {

        document.body.classList.add("loading");

        var url  = 'https://fuel-spot.com/api/automobile-fetch-models.php';
        var params ={
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
            },
            body: AUTH_KEY,
            method: "POST"
        };

        fetch(url, params)
            .then(res => res.json())
            .then(
                (result) => {

                    this.setState({
                        brands: result
                    });
                    document.body.classList.remove("loading");
                },
                (error) => {
                    alert("Araba listesi api'den çekilemedi!");
                    console.log(error);
                }
            );


    };



    handleInputChange(event) {

        const target = event.target;
        var value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // Primary Secondary
        // Fuel radio inputs
        //
        if ( name == "fuelPri" || name == "fuelSec" ) {
            switch ( value ) {
                case 'gasoline':
                    value = 0;
                    break;
                case 'diesel':
                    value = 1;
                    break;
                case 'lpg':
                    value = 2;
                    break;
                case 'electricity':
                    value = 3;
                    break;
                default:
                    value = -1;
            }

            if ( name === "fuelPri" ) {

                var secondary = document.querySelector('input[name="fuelSec"]:checked');
                if ( secondary ) {
                    secondary.checked = false;
                }
            }
        }


        // FILTER MODELS BY BRAND
        //
        if ( name == "brand" ) {
            var models = _.filter( this.state.brands, {brand: value} );
            var models_array = JSON.parse(models[0].model);
            this.setState(prevState => ({
                models: models_array
            }), () => {});
        }

        this.setState(prevState => ({
            vehicle: {
                ...prevState.vehicle,
                [name]: value
            }
        }));


    }


    fileSelectedHandler = event => {

        this.setState({
            photo: URL.createObjectURL(event.target.files[0]),
            selectedFile: event.target.files[0]
        });
    };


    fileUploadHandler = () => {

        function getBase64Image(img) {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        }

        var base64 = getBase64Image( document.getElementById("FUELSPOT_UPLOAD") );
        return base64;
    };



    base64(file){

        return new Promise(function(success, error) {

            var coolFile = {};

            function readerOnload(e) {
                var base64 = btoa(e.target.result);
                coolFile.base64 = base64;
                success(coolFile.base64)
            }

            var reader = new FileReader();
            reader.onload = readerOnload;

            //var file = file[0].files[0];
            coolFile.filetype = file.type;
            coolFile.size = file.size;
            coolFile.filename = file.name;

            console.log(coolFile, file);
            reader.readAsBinaryString(file);
        });

    }




    async submit(e) {

        e.preventDefault();

        const img = await this.base64( this.state.selectedFile );

        var url  = 'https://fuel-spot.com/api/automobile-add.php';
        var paramMendatory = 'username='+ this.state.user.username +'&carBrand='+ this.state.vehicle.brand + '&carModel=' + this.state.vehicle.model + '&plateNo=' + this.state.vehicle.plateNo + '&fuelPri='+ this.state.vehicle.fuelPri + '&fuelSec='+ this.state.vehicle.fuelSec + '&kilometer='+ this.state.vehicle.kilometer + '&carPhoto='+ img + '&' + AUTH_KEY;

        var params ={
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
            },
            body:  paramMendatory,
            method: "POST"
        };

        fetch(url, params)
            .then(res => res.json())
            .then(
                (VEHICLE) => {
                    this.userUpdate(VEHICLE);
                    document.body.classList.remove("loading");
                },
                (error) => {
                    alert("Araç ekleme başarısız!");
                    console.log(error);
                }
            );
    }




    userUpdate = (VEHICLE) => {

        console.log(VEHICLE,this.state);

        var url  = 'https://fuel-spot.com/api/user-update.php';
        var paramMendatory = 'username='+ this.state.user.username +'&country='+ this.state.userGeocode[0] + '&language=' + this.state.userGeocode[1] + '&vehicles=' + VEHICLE[0].id + ';&' + AUTH_KEY;

        var params ={
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
            },
            body:  paramMendatory,
            method: "POST"
        };

        fetch(url, params)
            .then(
                () => {
                    console.log("Kullanıcı güncelleme başarılı.");

                    const FUELSPOT_STORAGE = JSON.parse(localStorage.getItem("FUELSPOT_USER"));
                    FUELSPOT_STORAGE.user.vehicles = VEHICLE[0];

                    localStorage.setItem("FUELSPOT_USER", JSON.stringify(FUELSPOT_STORAGE));

                    this.props.cb();
                },
                (error) => {
                    alert("Kullanıcı güncelleme BAŞARISIZ!");
                    console.log(error);
                }
            );


    };








    render() {


        return (

            <form onSubmit={this.submit} className="text-left">
                <div className="card">

                    <div className="card-body">

                        <div className="row">

                            <div className="col-4 text-center">
                                <img src={this.state.photo || this.state.user.photo} id="FUELSPOT_UPLOAD" className="card-img rounded-circle" />
                                <h4 className="mt-2">{this.state.user.name}</h4>
                            </div>

                            <div className="col-8">

                                <div className="p-4">

                                    <div className="form-group">
                                        <label>İstasyon Fotoğrafı</label>
                                        <input onChange={this.fileSelectedHandler} type="file" className="form-control" />
                                        <button className="btn btn-primary" onClick={this.fileUploadHandler}>UPLOAD</button>
                                    </div>


                                    <div className="form-group station-register-map">
                                        <GoogleApiCont />
                                    </div>


                                    <div className="form-group">
                                        <label>İstasyon Adı</label>
                                        <input name="plateNo" type="text" className="form-control" onChange={this.handleInputChange} placeholder=""/>
                                    </div>

                                    <div className="form-group">
                                        <label>İstasyon Adresi</label>
                                        <input name="kilometer" type="text" onChange={this.handleInputChange} className="form-control" placeholder=""/>
                                        <small id="emailHelp" class="form-text text-muted">Bilgileri kimseyle paylaşmayacağız.</small>
                                    </div>

                                    <div className="form-group">
                                        <label>İstasyon Belge No</label>
                                        <input name="kilometer" type="text" onChange={this.handleInputChange} className="form-control" placeholder="BAY/XXX-XX/XXXXX"/>
                                        <small id="emailHelp" class="form-text text-muted">Bilgileri kimseyle paylaşmayacağız.</small>
                                    </div>



                                    <div className="form-group">
                                        <label>Ad Soyad</label>
                                        <input name="namesurname" type="text" onChange={this.handleInputChange} className="form-control" placeholder=""/>
                                    </div>
                                    <div className="form-group">
                                        <label>E-posta</label>
                                        <input name="email" type="text" onChange={this.handleInputChange} className="form-control" placeholder=""/>
                                    </div>
                                    <div className="form-group">
                                        <label>Telefon</label>
                                        <input name="tel" type="text" onChange={this.handleInputChange} className="form-control" placeholder=""/>
                                    </div>

                                    <div className="form-group">
                                        <p className="m-0">Cinsiyet</p>
                                        <div className="form-check form-check-inline">
                                            <input class="form-check-input" onChange={this.handleInputChange} type="radio" name="fuelPri" id="fuelPri_1" defaultValue="erkek" />
                                            <label class="form-check-label" for="fuelPri_1">Erkek</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input class="form-check-input" onChange={this.handleInputChange} type="radio" name="fuelPri" id="fuelPri_2" defaultValue="kadin"/>
                                            <label class="form-check-label" for="fuelPri_2">Kadın</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input class="form-check-input" onChange={this.handleInputChange} type="radio" name="fuelPri" id="fuelPri_3" defaultValue="woman"/>
                                            <label class="form-check-label" for="fuelPri_3">Diğer</label>
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

        )
    }
}




























class FuelSpot_CarRegister extends React.Component  {


    constructor(props) {
        super(props);
        this.state = {
            user: JSON.parse( localStorage.getItem("FUELSPOT_USER") ).user || false,
            userGeocode : JSON.parse( localStorage.getItem("FUELSPOT_USER") ).geocode || false
        };

        this.fetchAutoModels();
        this.handleInputChange = this.handleInputChange.bind(this);
        this.submit = this.submit.bind(this);
    }




    fetchAutoModels = () => {

        document.body.classList.add("loading");

        var url  = 'https://fuel-spot.com/api/automobile-fetch-models.php';
        var params ={
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
            },
            body: AUTH_KEY,
            method: "POST"
        };

        fetch(url, params)
            .then(res => res.json())
            .then(
                (result) => {

                    this.setState({
                        brands: result
                    });
                    document.body.classList.remove("loading");
                },
                (error) => {
                    alert("Araba listesi api'den çekilemedi!");
                    console.log(error);
                }
            );


    };



    handleInputChange(event) {

        const target = event.target;
        var value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        // Primary Secondary
        // Fuel radio inputs
        //
        if ( name == "fuelPri" || name == "fuelSec" ) {
            switch ( value ) {
                case 'gasoline':
                    value = 0;
                    break;
                case 'diesel':
                    value = 1;
                    break;
                case 'lpg':
                    value = 2;
                    break;
                case 'electricity':
                    value = 3;
                    break;
                default:
                    value = -1;
            }

            if ( name === "fuelPri" ) {

                var secondary = document.querySelector('input[name="fuelSec"]:checked');
                if ( secondary ) {
                    secondary.checked = false;
                }
            }
        }


        // FILTER MODELS BY BRAND
        //
        if ( name == "brand" ) {
            var models = _.filter( this.state.brands, {brand: value} );
            var models_array = JSON.parse(models[0].model);
            this.setState(prevState => ({
                models: models_array
            }), () => {});
        }

        this.setState(prevState => ({
            vehicle: {
                ...prevState.vehicle,
                [name]: value
            }
        }));


    }


    fileSelectedHandler = event => {

        this.setState({
            photo: URL.createObjectURL(event.target.files[0]),
            selectedFile: event.target.files[0]
        });
    };


    fileUploadHandler = () => {

        function getBase64Image(img) {
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var dataURL = canvas.toDataURL("image/png");
            return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        }

        var base64 = getBase64Image( document.getElementById("FUELSPOT_UPLOAD") );
        return base64;
    };



    base64(file){

        return new Promise(function(success, error) {

            var coolFile = {};

            function readerOnload(e) {
                var base64 = btoa(e.target.result);
                coolFile.base64 = base64;
                success(coolFile.base64)
            }

            var reader = new FileReader();
            reader.onload = readerOnload;

            //var file = file[0].files[0];
            coolFile.filetype = file.type;
            coolFile.size = file.size;
            coolFile.filename = file.name;

            console.log(coolFile, file);
            reader.readAsBinaryString(file);
        });

    }




    async submit(e) {

        e.preventDefault();

        const img = await this.base64( this.state.selectedFile );

        var url  = 'https://fuel-spot.com/api/automobile-add.php';
        var paramMendatory = 'username='+ this.state.user.username +'&carBrand='+ this.state.vehicle.brand + '&carModel=' + this.state.vehicle.model + '&plateNo=' + this.state.vehicle.plateNo + '&fuelPri='+ this.state.vehicle.fuelPri + '&fuelSec='+ this.state.vehicle.fuelSec + '&kilometer='+ this.state.vehicle.kilometer + '&carPhoto='+ img + '&' + AUTH_KEY;

        var params ={
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
            },
            body:  paramMendatory,
            method: "POST"
        };

        fetch(url, params)
            .then(res => res.json())
            .then(
                (VEHICLE) => {
                    this.userUpdate(VEHICLE);
                    document.body.classList.remove("loading");
                },
                (error) => {
                    alert("Araç ekleme başarısız!");
                    console.log(error);
                }
            );
    }




    userUpdate = (VEHICLE) => {

        console.log(VEHICLE,this.state);

        var url  = 'https://fuel-spot.com/api/user-update.php';
        var paramMendatory = 'username='+ this.state.user.username +'&country='+ this.state.userGeocode[0] + '&language=' + this.state.userGeocode[1] + '&vehicles=' + VEHICLE[0].id + ';&' + AUTH_KEY;

        var params ={
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
            },
            body:  paramMendatory,
            method: "POST"
        };

        fetch(url, params)
            .then(
                () => {
                    console.log("Kullanıcı güncelleme başarılı.");

                    const FUELSPOT_STORAGE = JSON.parse(localStorage.getItem("FUELSPOT_USER"));
                    FUELSPOT_STORAGE.user.vehicles = VEHICLE[0];

                    localStorage.setItem("FUELSPOT_USER", JSON.stringify(FUELSPOT_STORAGE));

                    this.props.cb();
                },
                (error) => {
                    alert("Kullanıcı güncelleme BAŞARISIZ!");
                    console.log(error);
                }
            );


    };








    render() {


        return (

                <form onSubmit={this.submit} className="text-left">
                    <div className="card">

                        <div className="card-body">

                            <div className="row">

                                <div className="col-4 text-center">
                                    <img src={this.state.photo || this.state.user.photo} id="FUELSPOT_UPLOAD" className="card-img rounded-circle" />
                                    <h4 className="mt-2">{this.state.user.name}</h4>
                                </div>

                                <div className="col-8">

                                    <div className="p-4">

                                        <div className="form-group">
                                            <label>Araç Fotoğrafı</label>
                                            <input onChange={this.fileSelectedHandler} type="file" className="form-control" />
                                            <button className="btn btn-primary" onClick={this.fileUploadHandler}>UPLOAD</button>
                                        </div>


                                        <div className="form-group">
                                            <label>Araç Modeli</label>
                                            <select name="brand" className="form-control" onChange={this.handleInputChange} defaultValue="">
                                                { this.state.brands && this.state.brands.map((item, i) =>
                                                    <option key={i} value={item.brand}>
                                                        {item.brand}
                                                    </option>
                                                )}
                                            </select>
                                            <select name="model" className="form-control" onChange={this.handleInputChange} defaultValue="">
                                                { this.state.models && this.state.models.map((item, i) =>
                                                    <option key={i} value={item}>
                                                        {item}
                                                    </option>
                                                )}
                                            </select>
                                        </div>




                                        <div className="form-group">
                                            <label>Araç Plakası</label>
                                            <input name="plateNo" type="text" className="form-control" onChange={this.handleInputChange} placeholder="16 U 1320"/>
                                        </div>

                                        <div className="form-group">
                                            <label>Araç KM Bilgisi</label>
                                            <input name="kilometer" min="0" step="1000" type="number" onChange={this.handleInputChange} className="form-control" placeholder="24000"/>
                                            <small id="emailHelp" class="form-text text-muted">Bilgileri kimseyle paylaşmayacağız.</small>
                                        </div>

                                        <div className="form-group">
                                            <p className="m-0">Birincil yakıt</p>
                                            <div className="form-check form-check-inline">
                                                <input class="form-check-input" onChange={this.handleInputChange} type="radio" name="fuelPri" id="fuelPri_1" defaultValue="gasoline" />
                                                <label class="form-check-label" for="fuelPri_1">Benzin</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input class="form-check-input" onChange={this.handleInputChange} type="radio" name="fuelPri" id="fuelPri_2" defaultValue="diesel"/>
                                                <label class="form-check-label" for="fuelPri_2">Dizel</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input class="form-check-input" onChange={this.handleInputChange} type="radio" name="fuelPri" id="fuelPri_3" defaultValue="lpg"/>
                                                <label class="form-check-label" for="fuelPri_3">LPG</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input class="form-check-input" onChange={this.handleInputChange}  type="radio" name="fuelPri" id="fuelPri_4" defaultValue="electricity"/>
                                                <label class="form-check-label" for="fuelPri_4">Elektrik</label>
                                            </div>
                                        </div>

                                        <div className="form-group" id="ikincil">
                                            <p className="m-0">İkincil yakıt</p>
                                            <div className="form-check form-check-inline">
                                                <input class="form-check-input" onChange={this.handleInputChange} type="radio" name="fuelSec" id="fuelSec_1" value="gasoline"/>
                                                <label class="form-check-label" for="fuelSec_1">Benzin</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input class="form-check-input" onChange={this.handleInputChange} type="radio" name="fuelSec" id="fuelSec_2" value="diesel"/>
                                                <label class="form-check-label" for="fuelSec_2">Dizel</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input class="form-check-input" onChange={this.handleInputChange} type="radio" name="fuelSec" id="fuelSec_3" value="lpg"/>
                                                <label class="form-check-label" for="fuelSec_3">LPG</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input class="form-check-input" onChange={this.handleInputChange} type="radio" name="fuelSec" id="fuelSec_4" value="electricity"/>
                                                <label class="form-check-label" for="fuelSec_4">Elektrik</label>
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
                                <NavLink activeClassName='is-active' className="btn btn-fuelspot" to="/news">Güncel</NavLink>
                                <NavLink activeClassName='is-active' className="btn btn-fuelspot" to="/vehicles">Aracım</NavLink>
                                <NavLink activeClassName='is-active' className="btn btn-fuelspot" to="/profile">Profil</NavLink>
                                <NavLink activeClassName='is-active' className="btn btn-fuelspot" to="/">Ayarlar</NavLink>
                            </nav>
                        </div>
                    </header>
                    <main id="content">
                        <Route exact path="/" component={FuelSpot_STATIONS} />
                        <Route path="/news" component={FuelSpot_NEWS} />
                        <Route path="/vehicles" component={FuelSpot_VEHICLES} />
                        <Route path="/profile" component={FuelSpot_PROFILE} />
                    </main>

                </div>
            </Router>
        )
    }
}











class FuelSpot_PRIVACY extends React.Component {

    render() {
        return (
        <div className="col col-sm-6 mx-auto text-white">
            <h1>Privacy Policy</h1>
            <p>
                This Privacy Policy was last modified on June 23, 2017.
                Services provided by FuelSpot (“us”, “we”, or “our”) include all our websites and all our mobile applications on all platforms (the “Service”). This page informs you of our policies regarding the collection, use and disclosure of Personal Information and Non-Personal Information we receive from users of the Service. By using the Service, you agree to the collection and use of information in accordance with this policy.
                What information we collect
                Personal Information
                Personal Information is information that identifies you or another person, which may be transmitted or received when you use the Service. We do NOT collect any Personal Information.

                Non-Personal Information
                Like many online services, we collect information that your browser or phone sends whenever you use our Service (“Log Data”). This Log Data may include information such as your device Internet Protocol (“IP”) address, type, version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages and other statistics.

                How we use your information we collect
                Personal Information. We do NOT collect and use Personal Information in any way.

                Non-Personal Information. Generally non-personal information is used internally to monitor and improve the Service, to perform analyses of the behavior of our users, to measure user demographics and interests, to describe our services to third parties such as advertisers and to analyze how and where best to use our resources. We do not combine Non-Personal Information with Personal Information.

                How we share the information we collect
                Personal Information. We do NOT collect and share Personal Information in any way.

                Non-Personal Information. We accept advertisements from Third Parties ad networks which may be displayed in our Service. We may share certain information with third-party advertisers, ad networks and ad platforms (“Advertising Entities”) to develop and deliver targeted advertising in the Service. We may also allow Advertising Entities to collect non-personal information within the Services which they may share with us, including your device identifier, device type, device brand, device model, network type, device language, and IP address. Advertising entities may also collect non-personal information related to the performance of the advertisements, such as how many times an advertisement is shown, how long an advertisement is viewed, and any click-throughs of an advertisement.

                Links to third-party websites and services
                The Service may contain links to other websites and online services, including third-party advertisements. If you choose to click through to one of these other websites or online services, please note that any information you may provide will be subject to the privacy policy and other terms and conditions of that websites or service, and not to this Privacy Policy. We do not control third-party websites or services, and the fact that a link to such a website or service appears in the Service does not mean that we endorse them or have approved their policies or practices relating to user information. Before providing any information to any third-party website or service, we encourage you to review the privacy policy and other terms and conditions of that website or service.

                Although we don’t collect any Personal Information, the Service use third party services, which may do so. These services are:

                Google Admob & Google Analytics Their privacy policy can be found here: http://www.google.com/policies/privacy/

                Facebook Audience Network Their privacy policy can be found here: https://www.facebook.com/privacy/explanation

                Security
                We take reasonable measures to maintain the security and integrity of our Service and prevent unauthorized access to it or use thereof through generally accepted industry standard technologies and internal procedures. Please note, however, that there are inherent risks in transmission of information over the Internet or other methods of electronic storage and we cannot guarantee that unauthorized access or use will never occur.

                Compliance with laws and law enforcement
                We reserve the right to share your information with third parties if we believe such action is necessary in order to: (1) conform with the requirements of the law or to comply with legal process served upon us; (2) protect or defend our legal rights or property (3) investigate, prevent or take action regarding illegal activities, suspected fraud, situations involving potential threats to the physical safety of any person or violations of the terms and conditions of using our Service.

                Changes to this privacy policy
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on the Service. You are advised to review this Privacy Policy periodically for any changes. Your continued use of the Service following the posting of changes will mean you accept those changes.

                Contacting us
                If you have any questions or comments about this Policy or our privacy practices, or to report any violations of the Policy or abuse of the Service, please contact us at info@fuel-spot.com
            </p>
        </div>
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
                        <Route path='/public' component={FuelSpot_PUBLIC}/>
                        <Route component={FuelSpot_PUBLIC}/>
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
import React, {Component} from 'react';

const AUTH_KEY = "AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";

class Vehicles extends Component {

    getPurchases = (FUELSPOT_VEHICLE_ID) => {


        var url = 'https://fuel-spot.com/api/purchase-fetch.php';
        var paramMendatory = 'vehicleID=' + FUELSPOT_VEHICLE_ID + '&' + AUTH_KEY;

        var params = {
            headers: {
                "content-type": "application/x-www-form-urlencoded"
            },
            body: paramMendatory,
            method: "POST"
        };

        fetch(url, params)
            .then(res => res.json())
            .then(
                (result) => {

                    this.setState({
                        purchases: result
                    });
                },
                (error) => {
                    alert("Araç satınalımları api'den çekilemedi!");
                    console.log(error);
                }
            );


    };

    constructor(props) {
        super(props);
        this.state = {
            vehicles: null
        };

    }

    componentWillMount() {

        const FUELSPOT_VEHICLE_FUEL_TYPES = {};

        const FUELSPOT_STORAGE = JSON.parse(localStorage.getItem("FUELSPOT_USER"));
        const FUELSPOT_VEHICLE = FUELSPOT_STORAGE.user.vehicles;


        switch (FUELSPOT_VEHICLE.fuelPri) {
            case '0':
                FUELSPOT_VEHICLE_FUEL_TYPES.primary = "Benzin";
                break;
            case '1':
                FUELSPOT_VEHICLE_FUEL_TYPES.primary = "Dizel";
                break;
            case '2':
                FUELSPOT_VEHICLE_FUEL_TYPES.primary = "LPG";
                break;
            case '3':
                FUELSPOT_VEHICLE_FUEL_TYPES.primary = "Elektrik";
                break;
            default:
                FUELSPOT_VEHICLE_FUEL_TYPES.primary = -1;
        }
        switch (FUELSPOT_VEHICLE.fuelSec) {
            case '0':
                FUELSPOT_VEHICLE_FUEL_TYPES.secondary = "Benzin";
                break;
            case '1':
                FUELSPOT_VEHICLE_FUEL_TYPES.secondary = "Dizel";
                break;
            case '2':
                FUELSPOT_VEHICLE_FUEL_TYPES.secondary = "LPG";
                break;
            case '3':
                FUELSPOT_VEHICLE_FUEL_TYPES.secondary = "Elektrik";
                break;
            default:
                FUELSPOT_VEHICLE_FUEL_TYPES.secondary = -1;
        }


        this.setState({
            vehicles: FUELSPOT_VEHICLE,
            fuel: FUELSPOT_VEHICLE_FUEL_TYPES
        });


        this.getPurchases(FUELSPOT_VEHICLE);

    };

    render() {

        return (
            <div className="container-fluid p-3" id="ABOUT_US">
                <div className="row">

                    <div class="col-sm-4">
                        <div class="card">
                            <img src={this.state.vehicles.carPhoto} className="card-img-top"/>
                            <div class="card-body">
                                <h5 class="card-title">{this.state.vehicles.plateNo}</h5>
                                <h5 class="card-title">{this.state.vehicles.car_brand}</h5>
                                <p class="card-text">{this.state.vehicles.car_model}</p>
                                <p class="card-text">{this.state.vehicles.kilometer}</p>
                                <p class="card-text">{this.state.fuel.primary}</p>
                                <p class="card-text">{this.state.fuel.secondary}</p>

                                <a href="#" class="btn btn-primary">Düzenle</a>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-8">


                        <h1 className="text-white">Satın almalar</h1>

                        {this.state.purchases && this.state.purchases.map((item, i) =>

                            <div class="card">

                                <div class="container-fluid">
                                    <div class="row">
                                        <div class="col-2 align-self-center">
                                            <img className="card-img-top" src={item.stationIcon}/>
                                        </div>
                                        <div class="col-10 p-0">
                                            <table className="table table-striped">
                                                <tbody>
                                                <tr>
                                                    <th scope="col">Bonus</th>
                                                    <th scope="col">Tutar</th>
                                                </tr>
                                                </tbody>
                                                <tbody>
                                                <tr>
                                                    <td><h2>{item.bonus}</h2></td>
                                                    <td><h2>{item.totalPrice}</h2></td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div class="card-footer">
                                    <p class="card-text">{item.time}</p>
                                    <p class="card-text">{item.stationLocation}</p>
                                    <p class="card-text">{item.stationName}</p>
                                    <p class="card-text">{item.stationID}</p>
                                </div>
                            </div>
                        )}


                    </div>

                </div>
            </div>
        );
    }
}

export default Vehicles;
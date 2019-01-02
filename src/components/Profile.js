import React, {Component} from 'react';

const AUTH_KEY = "AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";




class Profile extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null
        };
    }

    componentWillMount() {

        const FUELSPOT_USER = JSON.parse( localStorage.getItem("FUELSPOT_USER") ).user;
        this.setState({
            user: FUELSPOT_USER
        });

        this.getComments(FUELSPOT_USER);

    };


    getComments = (FUELSPOT_USER) => {

        var url  = 'https://fuel-spot.com/api/comment-fetch.php';
        var paramMendatory = 'username=' + FUELSPOT_USER.username + '&' + AUTH_KEY;

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

                    this.setState({
                        comments: result
                    });

                },
                (error) => {
                    alert("Kullanıcı yorumları api'den çekilemedi!");
                    console.log(error);
                }
            );





    };


    render() {
        return (
            <div className="container-fluid p-3" id="ABOUT_US">
                <div className="row">

                    <div class="col-sm-4">
                        <div class="card">
                            <div className="card-img">
                                <img src={this.state.user.photo} className="card-img" />
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">{this.state.user.username}</h5>
                                <h5 class="card-title">{this.state.user.email}</h5>
                                <p class="card-text">{this.state.user.registrationDate}</p>
                                <a href="#" class="btn btn-primary">Düzenle</a>
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-8">
                        <h1 className="text-white">Yorumlar</h1>
                        { this.state.comments && this.state.comments.map((item, i) =>
                            Comments(item)
                        )}
                    </div>
                </div>
            </div>
        );
    }
}



function Comments(item) {
    return (
        <div class="card">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-2 align-self-top">
                        <img className="card-img-top" src={item.logo}/>
                    </div>
                    <div class="col-10 p-0">
                        <table className="table table-striped">
                            <tbody>
                                <tr>
                                    <td>Yorum</td>
                                </tr>

                                <tr>
                                    <td><h2>{item.comment}<p className="small">{item.time}</p></h2></td>
                                </tr>

                                <tr className="text-right">
                                    <td scope="col">Cevap</td>
                                </tr>

                                <tr className="text-right">
                                    <td><h2>{item.answer}<p className="small">{item.replyTime}</p></h2></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <p class="card-text">{item.stars}</p>
            </div>
        </div>
    )
}




export default Profile;
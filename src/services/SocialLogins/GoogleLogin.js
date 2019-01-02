import React, { Component } from 'react';
import config from './Config';

class GoogleLogin extends Component{
    constructor(props) {
        super(props)
    }

    componentDidMount(){
        (function() {
            var e = document.createElement("script");
            e.type = "text/javascript";
            e.async = true;
            e.src = "https://apis.google.com/js/client:platform.js?onload=gPOnLoad";
            var t = document.getElementsByTagName("script")[0];
            t.parentNode.insertBefore(e, t)
        })();
    }

    //Triggering login for google
    googleLogin = () => {
        let response = null;
        window.gapi.auth.signIn({
            callback: function(authResponse) {
                this.googleSignInCallback( authResponse )
            }.bind( this ),
            clientid: config.google, //Google client Id
            cookiepolicy: "single_host_origin",
            requestvisibleactions: "http://schema.org/AddAction",
            scope: "https://www.googleapis.com/auth/plus.login email"
        });
    };


    googleSignInCallback = (authResult) => {

        var _root = this;

        if (authResult['status']['signed_in']) {
            // Update the app to reflect a signed in user
            // Hide the sign-in button now that the user is authorized, for example:
            // document.getElementById('signinButton').setAttribute('style', 'display: none');

            if (authResult['status']['method'] == 'PROMPT') {
                window.gapi.client.load('oauth2', 'v2', function () {
                    window.gapi.client.oauth2.userinfo.get().execute(function (resp) {

                        _root.getUserGoogleProfile(resp);
                    })
                });
            }
        } else {
            // Update the app to reflect a signed out user
            // Possible error values:
            //   "user_signed_out" - User is signed-out
            //   "access_denied" - User denied access to your app
            //   "immediate_failed" - Could not automatically log-in the user
            console.log('Sign-in state: ' + authResult['error']);
        }
    };




    // GOOGLE İLE GİRİŞ YAPILDI
    //

    getUserGoogleProfile = (user) => {

        console.log(user);

        var name        = user.name;
        var username    = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s/g, '');
        var email       = user.email;
        var photo       = user.picture;

        var url;

        console.log(this.props);


        if( this.props.userType == "REGULAR_USER" ) {
            url = "https://fuel-spot.com/api/user-create.php";
        }

        if( this.props.userType == "SUPER_USER" ) {
            url = "https://fuel-spot.com/api/superuser-create.php";
        }

        const body = "username=" + username + "&name=" + name + "&email=" + email + "&photo=" + photo + "&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
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
                (result) => {
                    this.props.cb( result );

                    //const url = "https://fuel-spot.com/api/user-fetch.php";
                    //const body = "username=" + username + "&AUTH_KEY=Ph76g0MSZ2okeWQmShYDlXakjgjhbe";
                    //const params ={
                    //    headers: {
                    //        "content-type" : "application/x-www-form-urlencoded"
                    //    },
                    //    body: body,
                    //    method: "POST"
                    //};
                    //
                    //fetch(url, params)
                    //    .then(res => res.json())
                    //    .then(
                    //        (result) => {
                    //            console.log(result.text(), "Kullanıcı");
                    //            this.props.cb("REGISTER", result );
                    //
                    //        },
                    //        (error) => {
                    //            console.log(error,"İstasyon FuelSpot'da kayıtlı değil. Görüntülenmeyecek.");
                    //        }
                    //    );


                }
            )
            .catch(err => {
                if ( err.name === "AbortError" ) {
                    console.error("Fetch aborted, User create api hatası.", err)
                } else {
                    console.error("Dönen kullanıcı verisi JSON değil", err)
                }
            })




    };




    render(){
        return(
            <button className="btn btn-danger"  onClick={ () => this.googleLogin()} >
                Google ile giriş yap
            </button>
        )
    }
}

export default GoogleLogin;
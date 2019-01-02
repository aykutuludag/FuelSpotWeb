import React, { Component } from 'react';
import config from './Config';

class FacebookLogin extends Component{

    componentDidMount(){
        // Load the required SDK asynchronously for facebook, google and linkedin
        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));

        window.fbAsyncInit = function() {
            window.FB.init({
                appId      : config.facebook,
                cookie     : true,  // enable cookies to allow the server to access the session
                xfbml      : true,  // parse social plugins on this page
                version    : 'v3.2' // use version 2.1
            });
        };
    }

    facebookLogin = () => {
        /*window.FB.login(
         this.checkLoginState(),
         { scope : 'email, public_profile' } //Add scope whatever you need about the facebook user
         ); */

        window.FB.login(
            function(resp){
                this.statusChangeCallback(resp);
            }.bind(this),{ scope : 'email,user_work_history,user_education_history,user_location,public_profile' });
    };

    checkLoginState() {
        alert("Checking Login Status")
        console.log( "Checking login status..........." );

        window.FB.getLoginStatus(function(response) {
            alert("FB Callback")
            console.log("----------->")
            console.log(response)
            this.statusChangeCallback(response);
        }.bind(this));
    }

    statusChangeCallback(response) {
        console.log('statusChangeCallback');
        console.log(response);
        if (response.status === 'connected') {
            alert( "Connected to facebook. Retriving user from fb" );
            // Logged into your app and Facebook.
            this.fetchDataFacebook();
        } else if (response.status === 'not_authorized') {
            console.log('Import error', 'Authorize app to import data', 'error')
        } else {
            console.log('Import error', 'Error occured while importing data', 'error')
        }
    }

    fetchDataFacebook = () => {
        console.log('Welcome!  Fetching your information.... ');

        window.FB.api('/me', function(user) {
            console.log( user );
            console.log('Successful login from facebook : ' + user.name);
            alert( 'Successful login for: ' + user.name );


            var name        = user.name;
            var username    = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s/g, '');
            var email       = user.email;
            var photo       = user.picture;

            const url = "https://fuel-spot.com/api/user-create.php";
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
                    }
                )
                .catch(err => {
                    if ( err.name === "AbortError" ) {
                        console.error("Fetch aborted, User create api hatası.", err)
                    } else {
                        console.error("Dönen kullanıcı verisi JSON değil", err)
                    }
                })



        });
    };

    render(){
        return(
        <button className="btn btn-primary"  onClick={ () => this.facebookLogin()} >
            Facebook ile giriş yap
        </button>
        )
    }
}

export default FacebookLogin;
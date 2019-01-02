export function GetGeoCode(USER_POSITION) {

    return new Promise(function(success, error) {

        var onScriptLoad = () => {

            var geocoder = new window.google.maps.Geocoder;

            var latlng = {
                lat: parseFloat(USER_POSITION.coords.latitude),
                lng: parseFloat(USER_POSITION.coords.longitude)
            };

            geocoder.geocode({'location': latlng}, function (results, status) {
                if (status === 'OK') {
                    if (results[0]) {

                        var countries = require('country-data').countries,
                            currencies = require('country-data').currencies,
                            regions = require('country-data').regions,
                            languages = require('country-data').languages,
                            callingCountries = require('country-data').callingCountries;

                        var USER_COUNTRY_SHORT_CODE = results[8].address_components[0].short_name;
                        var USER_LANGUAGE = countries[USER_COUNTRY_SHORT_CODE].languages;
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
                        const params = {
                            headers: {
                                "content-type": "application/x-www-form-urlencoded"
                            },
                            body: body,
                            method: "POST"
                        };



                        fetch(url, params)
                            .then(response => response.json())
                            .then(
                                (USER_TAXES) => {

                                    let GEO_CODE = [ USER_COUNTRY_SHORT_CODE, USER_LANGUAGE[0], USER_CURRENCIES, USER_UNIT, USER_TAXES[0] ];
                                    success(GEO_CODE);
                                }
                            )
                            .catch(err => {
                                console.error("Other-tax api fetch hatası.", err)
                            })




                    } else {
                        window.alert('Hata: Adres bilgisi alınamadı.');
                    }
                } else {
                    window.alert('Hata: Google status OK değil hatası: ' + status);
                }
            });


        };



        if (!window.google) {
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = `https://maps.google.com/maps/api/js?key=AIzaSyApL2s7lB-bFleuq6inzkHkGvB-_l5ieXE`;
            var x = document.getElementsByTagName('script')[0];
            x.parentNode.insertBefore(s, x);
            // Below is important.
            //We cannot access google.maps until it's finished loading
            s.addEventListener('load', e => {
                onScriptLoad()
            })
        } else {
            onScriptLoad()
        }

});


}
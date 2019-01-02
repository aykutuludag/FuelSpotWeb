export function GetLatLng() {

    return new Promise(function(success, error) {

        if (!navigator.geolocation){
            window.alert("Hata: Tarayıcınız geolocation desteklemiyor");
            return;
        }

        navigator.geolocation.getCurrentPosition(success, error);
    });

}
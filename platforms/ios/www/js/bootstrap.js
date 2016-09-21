function deviceReady(){
    // bootstrap angular when device ready is triggered
    // This assumes your app is named "app" and is on the body tag: <body ng-app="app">
    var domElement = document.querySelector('body');
    angular.bootstrap(domElement, ['starter']);
}

// if window.cordova is defined
// and it contains the isLocal variable
// and the isLocal === true
// it is running localy in the browser
// else it is running in cordova
if (window.cordova && cordova.hasOwnProperty('isLocal') && cordova.isLocal) {
    window.isCordova = false;
    console.log("URL: Running in browser");
    setTimeout(function() {
        console.log("timeout");
        deviceReady();
    }, 1000);

} else {
    console.log("URL: Running in Cordova/PhoneGap");
    document.addEventListener("deviceready", deviceReady, false);
    window.isCordova = true;
}
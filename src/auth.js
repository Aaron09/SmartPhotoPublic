
var Auth = function() {

    var loggedIn = false;

    this.loginComplete = function() { 
        loggedIn = true;
    }

    this.logoutComplete = function() {
        loggedIn = false;
    }

    this.isLoggedIn = function () {
        return loggedIn;
    }
}

export default Auth;
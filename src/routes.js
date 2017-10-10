import React from "react"

import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom"

import RootImageEditor from "./components/rootimageeditor"
import NotFoundPage from "./components/notfoundpage"
import HomePage from "./components/homepage"
import SignUpPage from "./components/signuppage"
import LoginPage from "./components/loginpage"
import LogoutPage from "./components/logoutpage"
import StoragePage from "./components/storagepage"

import Auth from "./auth"

var auth = new Auth();

"use strict";

function isLoggedIn() {
    return auth.isLoggedIn();
}

/**
 * Routes for the application
 * @param {*} props beginning state of the application
 */
const Routes = (props) => {
    return (
        <Router {...props}>
            <Switch>
                <Route exact path="/" render={HomeRedirectWrapper} />
                <Route path="/home" render={HomeWrapper} />
                <Route path="/edit" render={EditWrapper} />
                <Route path="/storage" render={StorageWrapper} />
                <Route path="/signup" render={SignUpWrapper} />
                <Route path="/login" render={LoginWrappr} />
                <Route path="/logout" render={LogoutWrapper} />
                <Route path="*" component={NotFoundPage} />
            </Switch>
        </Router>
    );
};

/**
 * Wrapper allowing log in page to access authentication status, also allows
 * page to open on history change (IN OTHER SOLUTIONS, THE URL CHANGES BUT THE PAGE DOES 
 * NOT LOAD. DO NOT CHANGE THIS CODE OR STRUCTURE).
 * @param {*} props original props
 */
const LoginWrappr = (props) => {
    return (
        (isLoggedIn() ? <Redirect to="/logout" push /> :
            <LoginPage auth={auth} {...props} />)
    );
}

/**
 * Wrapper allowing log out page to access authentication status, also allows
 * page to open on history change (IN OTHER SOLUTIONS, THE URL CHANGES BUT THE PAGE DOES 
 * NOT LOAD. DO NOT CHANGE THIS CODE OR STRUCTURE).
 * @param {*} props original props
 */
const LogoutWrapper = (props) => {
    return (
        (isLoggedIn() ? <LogoutPage auth={auth} {...props} /> : 
            <Redirect to="/login" push />)
    );
}

/**
 * Wrapper allowing sign up page to access authentication status, also allows
 * page to open on history change (IN OTHER SOLUTIONS, THE URL CHANGES BUT THE PAGE DOES 
 * NOT LOAD. DO NOT CHANGE THIS CODE OR STRUCTURE).
 * @param {*} props original props
 */
const SignUpWrapper = (props) => {
    return (
        (isLoggedIn() ? <Redirect to="/logout" push /> : 
            <SignUpPage auth={auth} {...props} />)
    );
}

/**
 * Wrapper allowing edit page to access authentication status, also allows
 * page to open on history change (IN OTHER SOLUTIONS, THE URL CHANGES BUT THE PAGE DOES 
 * NOT LOAD. DO NOT CHANGE THIS CODE OR STRUCTURE).
 * @param {*} props original props
 */
const EditWrapper = (props) => {
    return (
        (isLoggedIn() ? <RootImageEditor auth={auth} {...props} /> :
             <Redirect to="/login" push />)
    );
}

/**
 * Wrapper allowing storage page to access authentication status, also allows
 * page to open on history change (IN OTHER SOLUTIONS, THE URL CHANGES BUT THE PAGE DOES 
 * NOT LOAD. DO NOT CHANGE THIS CODE OR STRUCTURE).
 * @param {*} props original props
 */
const StorageWrapper = (props) => {
    return (
        (isLoggedIn() ? <StoragePage auth={auth} {...props} /> : 
            <Redirect to="/login" push />)
    );
}

/**
 * Wrapper allowing home page to access authentication status
 * @param {*} props original props
 */
const HomeWrapper = (props) => {
    return (
        <HomePage auth={auth} {...props} />
    );
}

/**
 * Redirect wrapper for the home page
 * @param {*} props original props
 */
const HomeRedirectWrapper = (props) => {
    return (
        <Redirect to="/home" push />
    );
}

export default Routes;
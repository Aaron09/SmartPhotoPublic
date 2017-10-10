import React from 'react';
import ReactDOM from 'react-dom';
import Routes from './routes';

import createBrowserHistory from 'history/createBrowserHistory';

"use strict";

/**
 * Entry point into the application
 */
window.onload = () => {
    ReactDOM.render(
        <Routes history={createBrowserHistory()}/>,
        document.getElementById('main')
    );
}

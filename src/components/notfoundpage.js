import React from "react"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/notfoundpage.css");
}

/**
 * Component which serves as the page for any endpoint that is not used
 */
class NotFoundPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = props;
    }

    render() {
        return (
            <h1> This page does not exist. #inception </h1>
        );
    }
}

export default NotFoundPage;
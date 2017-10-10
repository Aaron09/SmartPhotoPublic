import React from "react"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/editingtools.css");
}


/**
 * Component that houses the editing tools and saving status above the image
 */
class EditingTools extends React.Component {

    constructor(props) {
        super(props);
        this.state = props;
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    /**
     * Component should only update if the saving status changes
     * @param {*} nextState the next state of the component
     * @param {*} nextProps the next props of the component
     */
    shouldComponentUpdate(nextState, nextProps) {
        return (nextProps.savingStatus !== this.props.savingStatus);
    }

    render() {
        return (
            <div className="editing-tools-div">
                <span className="saving-status-span"> {this.props.savingStatus} </span>
            </div>
        );
    }
}

export default EditingTools;
import React from "react"

import EditSlider from "./editslider"
import EditCheckbox from "./editcheckbox"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/editpanel.css");
}

/**
 * Component containing most of the slide bar editing options for the user and a few
 * other editing options such as red eye and teeth whitening
 */
class EditPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = props;
    }

    componentWillReceiveProps(nextProps) {
        this.state = nextProps;
    }

    render() {
        return (
            <div className="edit-panel">
                <ul className="edit-checkbox-list">
                    {this.state.checkboxList.map(function(checkbox) {
                        return <EditCheckbox key={checkbox} checkboxName={checkbox} checkMade={this.state.checkMade} className="edit-checkbox-item" />
                    }, this)}
                </ul>
                <ul className="edit-slider-list">
                    {this.state.filterList.map(function(filter) {
                        return <EditSlider key={filter} filterName={filter} filterData={this.state.filterProperties[filter]} changeMadeCallback={this.state.sliderChangeComplete} editCallback={this.state.sliderMovementMade} className="edit-slider-item" />
                    }, this)}
                </ul>
            </div>
        );
    }
}

export default EditPanel;
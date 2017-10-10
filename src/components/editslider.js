import React from "react"

import Slider from 'rc-slider';

"use strict";

if (process.env.BROWSER) {
    require('rc-slider/assets/index.css');
    require("../static/css/editslider.css");
}

/**
 * Component for making image changes using a slide bar
 */
class EditSlider extends React.Component {
    constructor(props) {
        super(props);
        this.state = props;

        this.sliderChange = this.sliderChange.bind(this);
        this.userRelease = this.userRelease.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.state = nextProps;
    }

    /**
     * Called when the user moves the slider, changing the value
     * @param {*} filterName the name of the slider / filter being modified
     */
    sliderChange(filterName) {
        this.props.editCallback(filterName, this.refs[filterName].state.value);
    }

    /**
     * Called when the user releases the slider, completing the change
     * @param {*} filterName the name of the slider / filter being modified
     */
    userRelease(filterName) {
        this.props.changeMadeCallback(filterName, this.refs[filterName].state.value);
    }

    render() {
        return (
            <div className="edit-slider-item">
                <div className="filter-info">
                    <span className="filter-name"> {this.state.filterName} </span>
                    <span className="filter-value"> {this.state.filterData.value} </span>
                </div>
                <Slider ref={this.state.filterName} min={this.state.filterData.min} max={this.state.filterData.max} 
                step={1} defaultValue={this.state.filterData.defaultValue} onChange={() => this.sliderChange(this.state.filterName)} 
                onAfterChange={() => this.userRelease(this.state.filterName)}/>
            </div>
        );
    }
}

export default EditSlider;
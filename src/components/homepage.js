import React from "react"

import { Button, Carousel } from "react-bootstrap"

import NavigationBar from "./navigationbar"

"use strict";

if (process.env.BROWSER) {
    require("../static/css/homepage.css");
}

/**
 * Home page root component for displaying information about the editor and storage
 */
class HomePage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            direction: null
        };

        this.handleCarouselSelect = this.handleCarouselSelect.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.state = {
            index: 0,
            direction: null
        };
    }

    /**
     * Called when the user selects a direction to change the carousel
     */
    handleCarouselSelect(selectedIndex, event) {
        this.setState({index: selectedIndex, direction: event.direction});
    }

    render() {
        return (
            <div className="root-home-div"> 
                <div className="nav-section">
                    <NavigationBar auth={this.props.auth} />
                </div>
                <ul className="top-row-content">
                    <ul className="intro-content">
                        <div className="intro-name-div">
                            <span className="intro-name-span"> SmartPhoto </span>
                        </div>
                        <div className="intro-description-div">
                            <span className="intro-description-span"> An integrated photo storage and in-browser editing service. </span>
                        </div>
                        <ul className="feature-content">
                            <div className="edit-content">
                                <ul className="edit-info">
                                    <img style={{width: 12 + "vw", height: 15 + "vh"}} alt="editImg" src="img/editor_symbol.png" />
                                    <div>
                                        <span className="edit-span"> In-Browser Editing </span>
                                    </div>
                                </ul>
                            </div>
                            <div className="storage-content">
                                <ul className="storage-info">
                                    <img style={{width: 9 + "vw", height: 15 + "vh"}} alt="storageImg" src="img/cloud_storage_symbol.png" />
                                    <div>
                                        <span className="storage-span"> Auto-Saving Cloud Storage </span>
                                    </div>
                                </ul>
                            </div>
                        </ul>
                    </ul>
                    <div className="carousel-content">
                        <Carousel className="carousel-main" activeIndex={this.state.index} direction={this.state.direction} onSelect={this.handleCarouselSelect}>
                            <Carousel.Item>
                                <img style={{width: 100 + "%", height: 50 + "vh"}} alt="imgOne" src="img/illinois_altgelt_edit.JPG"/>
                                <Carousel.Caption>
                                    <h5>Edited with SmartPhoto</h5>
                                </Carousel.Caption>
                            </Carousel.Item>
                            <Carousel.Item>
                                <img style={{width: 100 + "%", height: 50 + "vh"}} alt="imgTwo" src="img/paddle_board_edit.png"/>
                                <Carousel.Caption>
                                    <h5>Edited with SmartPhoto</h5>
                                </Carousel.Caption>
                            </Carousel.Item>
                                <Carousel.Item>
                                <img style={{width: 100 + "%", height: 50 + "vh"}} alt="imgThree" src="img/illinois_union_edit.JPG"/>
                                <Carousel.Caption>
                                    <h5>Edited with SmartPhoto</h5>
                                </Carousel.Caption>
                            </Carousel.Item>
                        </Carousel>
                    </div>
                </ul>
            </div>
        );
    }
}

export default HomePage;
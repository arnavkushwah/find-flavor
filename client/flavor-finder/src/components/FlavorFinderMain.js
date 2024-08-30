import React from "react";

import '../App.css';
import BannerBackground from "../assets/home-banner-background.png";
import BannerImage from "../assets/home-banner-image.png";
import FlavorFinderForm from "./FlavorFinderForm";

const FlavorFinderMain = () => {
    return (
        <div className="home-banner-container">
            <div className="home-bannerImage-container">
                <img src={BannerBackground} alt="" />
            </div>
            <div className="home-text-section">
                <h1 className="primary-heading">
                    Find the go-to dish at any restaurant.
                </h1>
                <p className="primary-text">
                    Never order the wrong thing again! Use the Flavor Finder AI to find the best dish at any restaurant. Anywhere.
                </p>
                <FlavorFinderForm></FlavorFinderForm>
            </div>
            <div className="home-image-section">
                <img src={BannerImage} alt="" />
            </div>
      </div>
    );
}

export default FlavorFinderMain;

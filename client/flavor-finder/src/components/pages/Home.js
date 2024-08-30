import React from "react";

import '../../App.css';
import Navbar from "../Navbar";
import FlavorFinderMain from "../FlavorFinderMain";

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />
      <FlavorFinderMain />
    </div>
  );
};

export default Home;

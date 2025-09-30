// src/pages/Home/Home.jsx
import React from "react";
import ICSlider from "../../Components/ICSlider/ICSlider";
import Navbar from "../../Components/Navbar/Navbar";
import "./Home.css";

function Home() {
  return (
    <div>
      <Navbar />
      <ICSlider />
      {/* Add more homepage content here */}
    </div>
  );
}

export default Home;

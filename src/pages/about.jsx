import React from 'react';

const About = () => {
    return (
        <div className="px-6 py-12 about-page">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="mb-6 text-4xl font-bold text-black">About KrishiSat</h1>
                <p className="mb-4 text-lg text-black">
                    <span className="font-semibold">KrishiSat</span>, developed by X Boson AI, is a state-of-the-art remote sensing and GIS application leveraging space satellite technology and AI to promote sustainable agriculture, enhance farming productivity, and conserve resources.
                </p>
                <p className="mb-4 text-lg text-black">
                    It delivers real-time insights into crop health, water usage, and land productivity, empowering farmers with actionable data.
                </p>
                <p className="mb-4 text-lg text-black">
                    By using advanced analytics and geospatial tools, KrishiSat enables data-driven decisions that optimize resource use, minimize waste, and enhance overall agricultural efficiency, contributing to global food security.
                </p>
            </div>
        </div>
    );
};

export default About;

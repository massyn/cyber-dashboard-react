import React from "react";

import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    return (
        <div className="container">
            <h1 className="my-4">Welcome to Cyber Metrics</h1>
            <p>This is an example on how to generate graphs and insights using React.</p>
            <p>Find the source code on <a href="https://github.com/massyn/cyber-dashboard">https://github.com/massyn/cyber-dashboard</a></p>
            <h1 className="my-4">Pages</h1>
            <ul>
                <li><a href="/overview">Overview</a> page showing the score across an organisation</li>
                <li><a href="/business_units">Business Unit</a> - a similar visual broken down by a dimension</li>
                <li>Metrics (coming soon) - a table view of metrics</li>
                <li>Metrics detail (coming soon) - a specific metric view with trend and detail</li>
            </ul>

        </div>
    );
};

export default Home;

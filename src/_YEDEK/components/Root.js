import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import FuelSpot_STATIONS from './Stations';
import FuelSpot_NEWS from './News';

const Root = ({ store }) => (
    <Provider store={store}>
        <Router>

            <div className="container-fluid d-flex h-100 p-0 mx-auto flex-column">
                <header class="masthead mb-auto">
                    <div class="inner">
                        <h3 className="masthead-brand">FuelSpot</h3>
                        <nav class="nav nav-masthead justify-content-start btn-group">
                            <Link className="btn btn-fuelspot" to="/">İstasyonlar</Link>
                            <Link className="btn btn-fuelspot" to="/News">Güncel</Link>
                            <Link className="btn btn-fuelspot" to="/">Aracım</Link>
                            <Link className="btn btn-fuelspot" to="/">Profil</Link>
                            <Link className="btn btn-fuelspot" to="/">Ayarlar</Link>
                        </nav>
                    </div>
                </header>
                <main id="content">
                    <Route exact path="/" component={FuelSpot_STATIONS} />
                    <Route exact path="/News" component={FuelSpot_NEWS} />
                </main>

            </div>



        </Router>
    </Provider>
);

Root.propTypes = {
    store: PropTypes.object.isRequired
};

export default Root;
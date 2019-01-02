import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Root from './components/Root';
import * as serviceWorker from './serviceWorker';
import './bootstrap.css';
import './index.css';

// Add these imports - Step 1
import { Provider } from 'react-redux';
import { store } from './redux';


ReactDOM.render(
    <Root store={store} />,
    document.getElementById('root')
);



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

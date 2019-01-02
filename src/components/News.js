import React, {Component} from 'react';

class News extends Component {
    render() {
        return (
            <div className="container-fluid p-3" id="ABOUT_US">
                <div className="row">

                    <div class="col-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Haber başlığı</h5>
                                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                <a href="#" class="btn btn-primary">Go somewhere</a>
                            </div>
                        </div>
                    </div>
                    <div class="col-8">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Haber başlığı</h5>
                                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                <a href="#" class="btn btn-primary">Go somewhere</a>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Haber başlığı</h5>
                                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                                <a href="#" class="btn btn-primary">Go somewhere</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default News;
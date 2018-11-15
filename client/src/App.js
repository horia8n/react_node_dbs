import React, {Component} from 'react';
import './App.css';

import SubComponent from './components/SubComponent';

class App extends Component {
    render() {
        return (
            <div className="App">
                {/*<SubComponent database="postgres/pg" idColumnName="id"/>*/}
                <SubComponent/>
            </div>
        );
    }
}

export default App;

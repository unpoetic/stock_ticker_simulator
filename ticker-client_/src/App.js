/* global Plotly:true */

import React, { Component } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory'
import './App.css';
import './styles/Resizer.css';
import socketIOClient from 'socket.io-client';

const Plot = createPlotlyComponent(Plotly);

class App extends Component {

    constructor(props) {
        super(props);
        
        const layout = {
            plotBackground: '#f3f6fa',
            margin: {t:0, r: 0, l: 50, b: 30},
        }

        this.state = {
            layout: layout,
            plotUrl: '',
            response: false,
            endpoint: 'http://127.0.0.1:4001'
        };
    }

    componentDidMount() {
        const { endpoint } = this.state;
        const socket = socketIOClient(endpoint);
        socket.on('FromAPI', data => this.setState({ response: data }));
    }
    
    render() {
        const { response } = this.state;
        
        if(response){
            let x = [];

            for(let i = 1; i < response.data[0].priceHistory.length - 1; i++) {
                x.push(i);
            }

            return (
                <div className="App">
                    <Plot
                        data={[{
                            x: x,
                            y: response.data[0].priceHistory,
                            type: 'line',
                            marker: {color: '#19d3f3'},
                            name: 'Line'
                        }]}
                        layout={this.state.layout}
                        config={{displayModeBar: false}}
                    />
                </div>
            );
        } else {
            return <div>Loading...</div>;
        }
    }
}

export default App;

import React from "react";
import KeplerGl from 'kepler.gl';
import {connect, useDispatch} from 'react-redux';
import {addDataToMap} from "kepler.gl/dist/actions/actions";
import {uiStateUpdaters} from 'kepler.gl/reducers'

const keplerToken = 'pk.eyJ1IjoiZWx0cmlueSIsImEiOiJjanF6OG5oaDQwMDI4NDlueWhjdHB3eHRjIn0.kDLQfa4ITrAniE6m4_aeBw';
const sampleTripData = {
  fields: [
    {name: 'tpep_pickup_datetime', format: 'YYYY-M-D H:m:s', type: 'timestamp'},
    {name: 'pickup_longitude', format: '', type: 'real'},
    {name: 'pickup_latitude', format: '', type: 'real'}
  ],
  rows: [
    ['2015-01-15 19:05:39 +00:00', -73.99389648, 40.75011063],
    ['2015-01-15 19:05:39 +00:00', -73.97642517, 40.73981094],
    ['2015-01-15 19:05:40 +00:00', -73.96870422, 40.75424576]
  ]
};

const sampleConfig = {
  visState: {
    filters: [
      {
        id: 'me',
        dataId: 'test_trip_data',
        name: 'tpep_pickup_datetime',
        type: 'timeRange',
        enlarged: true
      }
    ]
  }
};

class KeplerComponent extends React.Component{
  constructor(props){
    super(props);

  }

  render() {
    const initialUiState = {
      readOnly: true,
      mapState: {
        latitude: 37.5662805,
        longitude: 126.9846542
      }
    };

    return (
      <KeplerGl
        width={800}
        height={500}
        mapboxApiAccessToken={keplerToken}
        initialUiState={initialUiState}>
      </KeplerGl>
    )
  }

  addDataSet(){
    this.props.dispatch(
      addDataToMap({
        datasets: {
          info: {
            label: 'Sample Taxi Trips in New York City',
            id: 'test_trip_data'
          },
          data: sampleTripData
        },
        option: {
          centerMap: true,
          readOnly: false
        },
        config: sampleConfig
      })
    );

  }
}

const mapStateToProps = (state) => state;
const mapDispatchToProps = (dispatch) => ({dispatch});

export default connect(mapStateToProps, mapDispatchToProps)(KeplerComponent);


import React from "react";
import KeplerGl from 'kepler.gl';
import {connect} from 'react-redux';

const keplerToken = 'pk.eyJ1IjoiZWx0cmlueSIsImEiOiJjanF6OG5oaDQwMDI4NDlueWhjdHB3eHRjIn0.kDLQfa4ITrAniE6m4_aeBw';
class KeplerComponent extends React.Component{
  constructor(props){
    super(props)
  }

  render() {
    const initialUiState = {readOnly: true};
    return (
      <KeplerGl mapboxApiAccessToken={keplerToken}
                initialUiState={initialUiState}>
      </KeplerGl>
    )
  }
}

const mapStateToProps = (state) => state;
const mapDispatchToProps = (dispatch) => ({dispatch});

export default connect(mapStateToProps, mapDispatchToProps)(KeplerComponent);

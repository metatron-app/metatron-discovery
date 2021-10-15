import {connect} from 'react-redux';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import { replaceLoadDataModal } from './factories/load-data-modal';
import {injectComponents} from 'kepler.gl/components';
import React from 'react';
import KeplerGlSchema from 'kepler.gl/schemas';
import {processGeojson, processKeplerglJSON} from 'kepler.gl/processors';
import {addDataToMap, wrapTo} from 'kepler.gl/actions';

const ChartKeplerGl = injectComponents([replaceLoadDataModal()]);

class KeplerComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log( '>>>>> componentDidMount');
  }

  componentDidUpdate(_prevProps, _prevState, _snapshot) {
    console.log( '>>>>> componentDidUpdate');
  }

  render() {
    const KeplerGlTag = ChartKeplerGl;
    const initialUiState = {readOnly: true};
    return (
      <AutoSizer>
        {({height, width}) => (
          <KeplerGlTag
            mapboxApiAccessToken={this.props.mapboxAccessToken}
            id={this.props.compId}
            initialUiState={initialUiState}
            mint={false}
            width={width} height={height} />
        )}
      </AutoSizer>
    );

  }

  getDatasetToSave() {
    return KeplerGlSchema.getDatasetToSave(this.props.keplerGl[this.props.compId]);
  }

  getConfigToSave() {
    return KeplerGlSchema.getConfigToSave(this.props.keplerGl[this.props.compId]);
  }

  addGeoJson(data, id, keplerGlConfig) {
    let label = 'label_' + id;
    if (id && keplerGlConfig.config && keplerGlConfig.config.visState.layers.length > 0) {
      const layer = keplerGlConfig.config.visState.layers.find(layer => layer.config.dataId === id);
      if (layer) {
        label = layer.config.label;
      }
    }
    const datasets = {
      info: {
        label: label,
        id: id,
      },
      data: processGeojson(data)
    };

    this.addDataset(datasets, keplerGlConfig);
  }

  addDataset(data, keplerGlConfig) {
    this.props.dispatch(
      wrapTo(
        this.props.compId,
        addDataToMap({
                       datasets: data,
                       options: {
                         centerMap: keplerGlConfig.version ? false : true
                       },
                       config: keplerGlConfig.version ? KeplerGlSchema.parseSavedConfig(keplerGlConfig) : null
                     })
      )
    )
  }

  addKeplerGlJson(data, config) {
    this.props.dispatch(
      wrapTo(
        this.props.compId,
        addDataToMap(processKeplerglJSON({ datasets: data, config: config }))
      )
    )
  }
}

const mapStateToProps = (state) => state;
const mapDispatchToProps = (dispatch) => ({dispatch});

export default connect(mapStateToProps, mapDispatchToProps)(KeplerComponent);

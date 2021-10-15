import {LoadDataModalFactory} from 'kepler.gl/components';
import {withState} from 'kepler.gl/components';

const CustomLoadDataModalFactory = (...deps) => {
  const LoadDataModal = LoadDataModalFactory(...deps);
  const defaultLoadingMethods = LoadDataModal.defaultProps.loadingMethods;

  // add more loading methods
  LoadDataModal.defaultProps = {
    ...LoadDataModal.defaultProps,
    loadingMethods: [
      defaultLoadingMethods.find(lm => lm.id === 'upload')]
  };

  return withState([], (state) => {
    const keplerGlId = Object.keys(state.keplerGl)
      .find(key => state.keplerGl[key].uiState.currentModal === 'addData');
    return {...state.keplerGl.app, ...state.keplerGl[keplerGlId].uiState}
  }, {})(LoadDataModal);
};

CustomLoadDataModalFactory.deps = LoadDataModalFactory.deps;

export function replaceLoadDataModal() {
  return [LoadDataModalFactory, CustomLoadDataModalFactory];
}

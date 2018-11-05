import { UIOption } from '../../ui-option';
import { UILayers } from './ui-layers';
import { MapType } from '../../define/jido/jido-common';

/**
 * map chart uioption
 * Version 2.0
 */
export interface UIJidoOption extends UIOption {

  ////////////////////////////////////////////
  // Server Spec
  ////////////////////////////////////////////

  // map on / off
  showMapLayer?: boolean;

  // map service type
  map?: MapType;

  // service license
  licenseNotation?: string;

  // province layer on / off
  showDistrictLayer?: boolean;

  // province unit
  districtUnit?: string;

  // layer list
  layers?: UILayers[];

  // TODO specs which don't exist in server spec
  // map style (light, dark, colored)
  style?: string;

  ////////////////////////////////////////////
  // UI Spec
  ////////////////////////////////////////////

}

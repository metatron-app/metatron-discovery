import { UIOption } from '../../ui-option';
/**
 * 맵차트 화면 UI에 필요한 옵션
 * Version 2.0
 */
export interface UILayers {

  // layer type
  type?: string;

  name?: string;

  symbol?: string;

  color?: SymbolColor;

  size?: SymbolSize;

  outline?: SymbolOutline;

  clustering?: boolean;

  datasource?: string;

  viewRawData?: boolean;

  blur?: number;

  radius?: number;

  thickness?: Thickness;

  pathType?: string;

  shape?: string;

  coverage?: number;
}

/**
 * Symbol Color
 */
interface SymbolColor {

  by?: string;

  column?: string;

  schema?: string;

  transparency?: number;

  resolution?: number;

}

/**
 * Symbol Size
 */
interface SymbolSize {

  by?: string;

  column?: string;

}

/**
 * Thickness
 */
interface Thickness {

  by?: string;

  column?: string;

  maxValue?: number;

}

/**
 * Symbol Outline
 */
interface SymbolOutline {

  color?: string;

  thickness?: string;

  lineDash?: string;

}

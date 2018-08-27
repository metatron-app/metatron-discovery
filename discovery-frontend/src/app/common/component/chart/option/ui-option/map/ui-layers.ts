import { UIOption } from '../../ui-option';
/**
 * 바차트 화면 UI에 필요한 옵션
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
}

/**
 * Symbol Color
 */
interface SymbolColor {

  by?: string;

  column?: string;

  schema?: string;

  transparency?: number;

}

/**
 * Symbol Color
 */
interface SymbolSize {

  by?: string;

  column?: string;

}

/**
 * Symbol Outline
 */
interface SymbolOutline {

  color?: string;

  thickness?: string;

}

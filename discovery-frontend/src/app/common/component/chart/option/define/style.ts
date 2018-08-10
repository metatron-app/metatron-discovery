/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Created by Dolkkok on 2017. 8. 17..
 */

import { FontStyle, FontWeight, LineType, Position, SymbolType } from './common';

export interface DataStyle {
  // common
  color?: any;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  opacity?: number;
  // Item DataStyle
  borderColor?: any;
  borderWidth?: number;
  borderType?: LineType;
  textPosition?: Position;
  textAlign?: Position;
  // Line DataStyle
  width?: number;
  type?: LineType;
  curveness?: number;
}

export interface GraphicStyle {
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  font?: string;
  textAlign?: number;
  textVerticalAlign?: number;
  fill?: string;
  stroke?: number;
  lineWidth?: number;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowColor?: number;
  image?: string;
}

export interface TextStyle {
  color?: any;
  fontStyle?: FontStyle;
  fontWeight?: FontWeight;
  fontFamily?: string;
  fontSize?: number;
  opacity?: number;
  padding?: any;
}

export interface LabelStyle {
  rich?: any;
  align?: string;
  color?: any;
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  opacity?: number;
  show?: boolean;
  precision?: boolean;
  position?: Position;
  offset?: number[];
  formatter?: any;
  margin?: number;
  textStyle?: TextStyle;
  padding?: number[];
  backgroundColor?: string;
  textBorderColor?: string;
  textBorderWidth?: number;
  rotate?: number;
  fontSize?: number;
}

export interface SymbolStyle {
  symbol?: SymbolType;
  symbolSize?: any;
  color?: any;
  colorAlpha?: string;
  opacity?: number;
  colorLightness?: string;
  colorSaturation?: string;
  colorHue?: string;
}

export interface ItemStyleSet {
  normal: DataStyle;
  emphasis?: DataStyle;
}

export interface LineStyleSet {
  normal?: DataStyle;
}

export interface LabelStyleSet {
  normal: LabelStyle;
  emphasis?: LabelStyle;
}

export interface TextStyleSet {
  normal: TextStyle;
  emphasis?: TextStyle;
}

export interface LabelLine {
  show?: boolean;
  length?: number;
  length2?: number;
}

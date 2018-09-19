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

export abstract class Shelf {

  /**
   * Shelf 타입
   */
  public type: string;

  // Layers
  public layers: [any[]];

}

/**
 * 레이어 옵션 구조체
 */
export class Layer {

  public type: string;

  public name: string;

  public alias: string;

  public ref: string;

  public format?: DimensionFormat;

  public aggregationType?: string;

}

/**
 * 포맷 옵션 구조체
 */
export class DimensionFormat {

  public type: string;

  public method: string;

  public precision: number;

}

/**
 * Constants to be shared by the datasource and metadata
 */
import {Type} from "./type";

export namespace Constant {
  export namespace Filter {
    export type Role = (
      {
        label: string | any;
        value: string;
        checked: boolean
      }
      );
    export type Logical = ({
      label: string;
      value: Type.Logical | 'ALL';
    });

    export type Type = (
      {
        label: string;
        value: string
      }
      |
      {
        measure: boolean;
        label: string;
        value: string
      }
      |
      {
        label: string;
        value: string;
        derived: boolean
      }
      );
  }
}

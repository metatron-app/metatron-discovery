/**
 * Objects to be shared by the data source and metadata
 */
export namespace Constant {
  export namespace Filter {
    export type Role = (
      {
        label: string | any;
        value: string;
        checked: boolean
      }
      );

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

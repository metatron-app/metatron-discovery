export namespace Constant {

  export namespace FilterType {
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

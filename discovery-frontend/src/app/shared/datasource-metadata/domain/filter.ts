import {Type} from './type';

export namespace Filter {
  export class Logical {
    label: string;
    value: Type.Logical;
    icon: string;

    constructor(label: string, value: Type.Logical, icon: string) {
      this.label = label;
      this.value = value;
      this.icon = icon;
    }
  }

  export class Role {
    label: string | any;
    value: Type.Role;
    checked: boolean;

    constructor(label: string | any, value: Type.Role, checked: boolean) {
      this.label = label;
      this.value = value;
      this.checked = checked;
    }
  }
}

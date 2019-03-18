import {Type} from './type';

export namespace Filter {
  export class Logical {
    label: string;
    value: Type.Logical | 'ALL';

    constructor(label: string, value: Type.Logical | 'ALL') {
      this.label = label;
      this.value = value;
    }
  }

  export class Role {
    label: string | any;
    value: Type.Role | 'ALL';
    checked: boolean;

    constructor(label: string | any, value: Type.Role | 'ALL', checked: boolean) {
      this.label = label;
      this.value = value;
      this.checked = checked;
    }
  }
}

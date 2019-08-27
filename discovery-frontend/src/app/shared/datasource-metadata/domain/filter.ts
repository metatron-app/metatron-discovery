import {Type} from './type';
import {DataStorageConstant} from "../../../data-storage/constant/data-storage-constant";

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
    icon: string;
    checked: boolean;

    constructor(label: string | any, value: Type.Role, checked: boolean, icon: string) {
      this.label = label;
      this.value = value;
      this.checked = checked;
      this.icon = icon;
    }
  }

  export class Authentication {
    label: string;
    value: DataStorageConstant.Dataconnection.Authentiacation;

    constructor(label: string, value: DataStorageConstant.Dataconnection.Authentiacation) {
      this.label = label;
      this.value = value;
    }
  }

  export class Metadata { // TODO 추후 동적필터가 들어오게되면 제거 필요
    label: string;
    value: Type.MetadataSource;

    constructor(label: string, value: Type.MetadataSource) {
      this.label = label;
      this.value = value;
    }
  }
}

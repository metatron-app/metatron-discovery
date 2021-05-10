export namespace Catalog {
  export class Tree {
    countOfChild?: number;
    name: string;
    id: string;
    favorite: boolean;
    child: Tree;
    hierarchies?: any[];
    // Only used UI
    isOpened?: boolean;
  }

  export namespace Constant {
    export const CATALOG_ROOT_ID = 'ROOT';
  }
}

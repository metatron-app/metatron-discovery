export namespace Catalog {
  export class Tree {
    countOfChild: number;
    name: string;
    id: string;
    child: Tree;
  }
  
  export namespace Constant {
    export const CATALOG_ROOT_ID = 'ROOT';
  }
}

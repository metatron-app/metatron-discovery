/**
 * Objects to be shared by the datasource and metadata
 */
export namespace Type {
  export enum Role {
    MEASURE = 'MEASURE',
    DIMENSION = 'DIMENSION'
  }

  export enum WKT {
    POINT = 'POINT',
    LINESTRING = 'LINESTRING',
    POLYGON = 'POLYGON'
  }

  export enum Logical {

  }
}

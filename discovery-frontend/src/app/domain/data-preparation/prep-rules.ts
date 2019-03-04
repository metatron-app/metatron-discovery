export class AbstractPrepRule {
  public name: string;
  public isBuilder: boolean;
}

export class NestRule extends AbstractPrepRule {
  public col: string[];
  public newCol: string;
  public type: string;
}

export class HeaderRule extends AbstractPrepRule {
  public rownum: number;
}

export class DropRule extends AbstractPrepRule {
  public col: string[];
}

export class ExtractRule extends AbstractPrepRule {
  public col: string[];
  public pattern: string;
  public limit: number;
  public ignore?: string;
  public ignoreCase: boolean;
}

export class MoveRule extends AbstractPrepRule {
  public col: string[];
  public refColumn: string;
  public beforeAfter: string;
}

export class UnnestRule extends AbstractPrepRule {
  public col: string[];
  public element: string;
}

export class FlattenRule extends AbstractPrepRule {
  public col: string[];
}

export class SortRule extends AbstractPrepRule {
  public col: string[];
  public sortBy: string;
}

export class SetRule extends AbstractPrepRule {
  public col: string[];
  public expression: string;
  public condition?: string;
}

export class ReplaceRule extends AbstractPrepRule {
  public col: string[];
  public pattern: string;
  public newVal?: string;
  public ignore?: string;
  public matchOccurrence: boolean;
  public ignoreCase: boolean;
  public condition: string;
}

export class SetFormatRule extends AbstractPrepRule {
  public col: string[];
  public format: string;
}

export class SetTypeRule extends AbstractPrepRule {
  public col: string[];
  public type: string;
  public format?: string;
}

export class SplitRule extends AbstractPrepRule {
  public col: string[];
  public pattern: string;
  public limit: number;
  public ignore?: string;
  public ignoreCase: boolean;
}

export class MergeRule extends AbstractPrepRule {
  public col: string[];
  public delimiter: string;
  public newCol: string;
}

export class KeepRule extends AbstractPrepRule {
  public condition: string;
}

export class DeriveRule extends AbstractPrepRule {
  public expression: string;
  public newCol: string;
}

export class DeleteRule extends AbstractPrepRule {
  public condition: string;
}

export class CountPatternRule extends AbstractPrepRule {
  public col: string[];
  public ignore?: string;
  public pattern: string;
  public ignoreCase: boolean;
}

export class AggregateRule extends AbstractPrepRule {
  public col: string[];
  public expression: string[];
}

export class PivotRule extends AbstractPrepRule {
  public col: string[];
  public expression: string[];
  public group: string[];
}

export class UnpivotRule extends AbstractPrepRule {
  public col: string[];
  public groupEvery: string;
}

export class WindowRule extends AbstractPrepRule {
  public groupBy?: string[];
  public expression: string[];
  public sortBy?: string[];
}

export class RenameRule extends AbstractPrepRule {
  public col: string[];
  public to: string[];
}

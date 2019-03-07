package app.metatron.discovery.domain.dataprep.teddy;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidAggregationValueExpressionTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.InvalidColumnExpressionTypeException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.WrongWindowFunctionExpressionException;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Window;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Constant;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Identifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class DfWindow extends DataFrame {
    private static Logger LOGGER = LoggerFactory.getLogger(DfWindow.class);

    public DfWindow(String dsName, String ruleString) {
        super(dsName, ruleString);
    }

    //partition을 체크. 변경된경우 true, 유지된경우 false를 출력한다.
    private Boolean partitionCheck(List<String> partitionColNames, Map<String, Object> partitionSet, Row row) {
        if(partitionSet.isEmpty()) {
            for(String colName : partitionColNames) {
                partitionSet.put(colName, row.get(colName));
            }

            return true;
        } else {
            for(String colName : partitionColNames) {
                if(!partitionSet.get(colName).equals(row.get(colName))) {
                    partitionSet.clear();
                    return partitionCheck(partitionColNames, partitionSet, row);
                }
            }
        }
        return false;
    }

    //partitionSet이 변경된 경우 aggregatedDF에서 새로운 Aggregation 결과를 얻어오는 함수.
    private void getAggregatedValues(Map<String, Object> partitionSet, List<Object> aggregatedValues, DataFrame aggregatedDf) {
        boolean matched;
        aggregatedValues.clear();

        for(Row row : aggregatedDf.rows) {
            matched = true;
            for(String key : partitionSet.keySet()) {
                if(!row.get(key).equals(partitionSet.get(key))) {
                    matched = false;
                    break;
                }
            }

            if(matched) {
                for (int i = partitionSet.size(); i < row.size(); i++) {
                    aggregatedValues.add(row.get(i));
                }
                break;
            }
        }
    }

    @Override
    public List<Object> prepare(DataFrame prevDf, Rule rule, List<DataFrame> slaveDfs) throws TeddyException {
        List<Object> preparedArgs = new ArrayList<>();
        Window window = (Window) rule;

        Expression valueExpr = window.getValue();
        Expression groupExpr = window.getGroup();
        Expression orderExpr = window.getOrder();
        List<Expr.FunctionExpr> funcExprs = new ArrayList<>();
        List<String> groupColNames = new ArrayList<>();
        List<String> orderColNames = new ArrayList<>();

        // values
        if (valueExpr instanceof Expr.FunctionExpr) {
            funcExprs.add((Expr.FunctionExpr) valueExpr);
        } else if (valueExpr instanceof Expr.FunctionArrayExpr) {
            funcExprs.addAll(((Expr.FunctionArrayExpr) valueExpr).getFunctions());
        } else {
            throw new InvalidAggregationValueExpressionTypeException("doPivot(): invalid aggregation value expression type: " + valueExpr.toString());
        }

        // partition colnames
        if (groupExpr instanceof Identifier.IdentifierExpr) {
            groupColNames.add(((Identifier.IdentifierExpr) groupExpr).getValue());
        } else if (groupExpr instanceof Identifier.IdentifierArrayExpr) {
            groupColNames.addAll(((Identifier.IdentifierArrayExpr) groupExpr).getValue());
        } else if (groupExpr == null) {
            groupColNames.clear();
        } else {
            throw new InvalidColumnExpressionTypeException("doPivot(): invalid pivot column expression type: " + groupExpr.toString());
        }

        // orderby colnames
        if (orderExpr instanceof Identifier.IdentifierExpr) {
            orderColNames.add(((Identifier.IdentifierExpr) orderExpr).getValue());
        } else if (orderExpr instanceof Identifier.IdentifierArrayExpr) {
            orderColNames.addAll(((Identifier.IdentifierArrayExpr) orderExpr).getValue());
        } else if (orderExpr == null) {
            orderColNames.clear();
        } else {
            throw new InvalidColumnExpressionTypeException("doPivot(): invalid pivot column expression type: " + orderExpr.toString());
        }

        preparedArgs.add(funcExprs);
        preparedArgs.add(groupColNames);
        preparedArgs.add(orderColNames);
        return preparedArgs;
    }

    @Override
    public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
        List<Expr.FunctionExpr> funcExprs = (List<Expr.FunctionExpr>) preparedArgs.get(0);
        List<Expr.FunctionExpr> aggrExprs = new ArrayList<>();
        HashMap<String, Expr.FunctionExpr> newColNameAndFunctions = new HashMap<>();
        List<String> groupByColNames = (List<String>) preparedArgs.get(1);
        List<String> orderColNames = (List<String>) preparedArgs.get(2);
        List<Row> newRows = new ArrayList<>();

        LOGGER.trace("DfWindow.gather(): start: offset={} length={}", offset, length);

        //partition과 order에 따라 정렬한다.
        List<String> sortColNames = new ArrayList<>();
        sortColNames.addAll(groupByColNames);
        sortColNames.addAll(orderColNames);
        if(sortColNames.size() > 0) {
            this.sorted(prevDf, sortColNames, SortType.ASCENDING);
        } else {
            addColumnWithDfAll(prevDf);
            this.rows.addAll(prevDf.rows);
        }

        //Partition Column이 없다면 가상의 column을 만들어준다.
        Boolean hasDummyPartition = groupByColNames.isEmpty();
        String dummyColName = "";
        if(hasDummyPartition) {
            dummyColName = this.addColumn("dummy_Partition_Column", ColumnType.LONG);
            groupByColNames.add(dummyColName);
            for(Row row : this.rows) {
                row.add(dummyColName, 0L);
            }
        }

        //Aggregation Function과 Window Function 나눠담기.
        for (Expr.FunctionExpr funcExpr : funcExprs) {
            switch (funcExpr.getName()) {
                case "avg":
                case "count":
                case "sum":
                case "min":
                case "max":
                    aggrExprs.add(funcExpr);
                    break;
                default:
                    break;
            }
        }

        //Aggregation Function들의 값은 aggreatedDF를 만들어서 가져온다.
        DataFrame aggregatedDf = new DfAggregate(dsName, null);
        if(!aggrExprs.isEmpty()) {
            aggregatedDf.aggregate(this, groupByColNames, aggrExprs);
        }

        //새로운 column들을 추가한다.
        for (Expr.FunctionExpr funcExpr : funcExprs) {
            int i = funcExprs.indexOf(funcExpr) + 1;
            int newColPosition = 0;

            //column name
            String newColName = "window" + i + "_" + funcExpr.getName();
            List<Expr> args = funcExpr.getArgs();

            if(!args.isEmpty()) {
                String refColName = args.get(0).toString();
                newColName = newColName + "_" + refColName;
                newColPosition = getColnoByColName(refColName) + i;
            }

            //column type
            ColumnType newColType;
            switch (funcExpr.getName()) {
                case "row_number":
                    if(args.size()!=0)
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Invalid window function args: " + funcExpr.getName());
                    newColType = ColumnType.LONG;
                    break;
                case "rolling_avg":
                    if(args.size()!=3)
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Invalid window function args: " + funcExpr.getName());
                    if(!prevDf.getColTypeByColName(args.get(0).toString()).equals(ColumnType.LONG) && !prevDf.getColTypeByColName(args.get(0).toString()).equals(ColumnType.DOUBLE))
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): This function works with numeric values only: " + funcExpr.getName());
                    newColType = ColumnType.DOUBLE;
                    break;
                case "rolling_sum":
                    if(args.size()!=3)
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Invalid window function args: " + funcExpr.getName());
                    if(!prevDf.getColTypeByColName(args.get(0).toString()).equals(ColumnType.LONG) && !prevDf.getColTypeByColName(args.get(0).toString()).equals(ColumnType.DOUBLE))
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): This function works with numeric values only: " + funcExpr.getName());
                    newColType = prevDf.getColTypeByColName(args.get(0).toString());
                    break;
                case "lag":
                    if(args.size()!=2)
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Invalid window function args: " + funcExpr.getName());
                    newColType = prevDf.getColTypeByColName(args.get(0).toString());
                    break;
                case "lead":
                    if(args.size()!=2)
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Invalid window function args: " + funcExpr.getName());
                    newColType = prevDf.getColTypeByColName(args.get(0).toString());
                    break;
                case "sum":
                case "max":
                case "min":
                case "avg":
                case "count":
                    newColType = aggregatedDf.getColType(groupByColNames.size() + aggrExprs.indexOf(funcExpr));
                    break;
                default:
                    throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Unsupported window function: " + funcExpr.getName());
            }

            newColName = addColumnWithTimestampStyle(newColPosition, newColName, newColType, null);
            newColNameAndFunctions.put(newColName, funcExpr);
            interestedColNames.add(newColName);
        }

        //row 별로 새로운 값들 추가한다.
        Map<String, Object> partitionSet = new HashMap<>();
        List<Object> aggregatedValues = new ArrayList<>();
        List<Integer> partitionNumber = new ArrayList<>();
        int count=0;
        int partitionIndex=0;

        //각 row 별로 partition을 구분하기 위해서 리스트를 만든다.(rolling sum 등에 사용)
        for (Row row : this.rows) {
            Boolean isPartitionChanged = partitionCheck(groupByColNames, partitionSet, row);
            if (isPartitionChanged) {
                count++;
            }

            partitionNumber.add(count);
        }

        for (int i = 0; i<rows.size(); i++) {
            Row row = rows.get(i);
            Row newRow = new Row();
            //partition 변화여부 체크. 변화 했다면 partitionSet을 새로 생성하고 AggregatedValue도 새로 얻어 옴.
            if(partitionIndex != partitionNumber.get(i)) {
                partitionIndex = partitionNumber.get(i);
                count=1;
                partitionCheck(groupByColNames, partitionSet, row);
                getAggregatedValues(partitionSet, aggregatedValues, aggregatedDf);
            }

            //새로 추가해야 하는 컬럼들의 값을 채워 줌.
            for(int j = 0; j< getColCnt(); j++) {
                if(!newColNameAndFunctions.containsKey(getColName(j))) {
                    newRow.add(getColName(j), row.get(getColName(j)));
                }
                else {
                    Expr.FunctionExpr funcExpr = newColNameAndFunctions.get(getColName(j));
                    List<Expr> args = funcExpr.getArgs();
                    String targetColName;
                    int start;
                    int end;

                    //Aggregate Function 인경우의 처리. 미리 구해놓은 값을 넣어준다.
                    if (aggrExprs.contains(funcExpr)) {
                        Object value = aggregatedValues.get(aggrExprs.indexOf(funcExpr));
                        newRow.add(getColName(j), value);
                    } else {//Window Function인 경우의 처리.
                        switch (funcExpr.getName()) {
                            case "row_number":
                                newRow.add(getColName(j), (long) count++);
                                break;
                            case "rolling_sum":
                                targetColName = args.get(0).toString();
                                start = i - args.get(1).eval(row).asInt();
                                end = i + args.get(2).eval(row).asInt() + 1;

                                if (this.getColTypeByColName(targetColName) == ColumnType.LONG) {
                                    long value = 0L;
                                    for (int k = start; k < end; k++) {
                                        if (k >= 0 && k < rows.size() && partitionNumber.get(k) == partitionIndex) {
                                            value = value + (long) rows.get(k).get(targetColName);
                                        }
                                    }
                                    newRow.add(getColName(j), value);
                                } else {
                                    double value = 0D;
                                    for (int k = start; k < end; k++) {
                                        if (k >= 0 && k < rows.size() && partitionNumber.get(k) == partitionIndex) {
                                            value = value + (double) rows.get(k).get(targetColName);
                                        }
                                    }
                                    newRow.add(getColName(j), value);
                                }
                                break;
                            case "rolling_avg":
                                targetColName = args.get(0).toString();
                                start = i - args.get(1).eval(row).asInt();
                                end = i + args.get(2).eval(row).asInt() + 1;
                                int avg_count = 0;

                                if (this.getColTypeByColName(targetColName) == ColumnType.LONG) {
                                    long value = 0L;
                                    for (int k = start; k < end; k++) {
                                        if (k >= 0 && k < rows.size() && partitionNumber.get(k) == partitionIndex) {
                                            avg_count++;
                                            value = value + (long) rows.get(k).get(targetColName);
                                        }
                                    }
                                    newRow.add(getColName(j), (double) (value / avg_count));
                                } else {
                                    double value = 0D;
                                    for (int k = start; k < end; k++) {
                                        if (k >= 0 && k < rows.size() && partitionNumber.get(k) == partitionIndex) {
                                            avg_count++;
                                            value = value + (double) rows.get(k).get(targetColName);
                                        }
                                    }
                                    value = value / avg_count;
                                    newRow.add(getColName(j), value);
                                }
                                break;
                            case "lag":
                                targetColName = args.get(0).toString();
                                start = i - args.get(1).eval(row).asInt();

                                if (start >= 0 && partitionNumber.get(start) == partitionIndex) {
                                    newRow.add(getColName(j), rows.get(start).get(targetColName));
                                } else {
                                    newRow.add(getColName(j), null);
                                }
                                break;
                            case "lead":
                                targetColName = args.get(0).toString();
                                start = i + args.get(1).eval(row).asInt();

                                if (start >= 0 && start < rows.size() && partitionNumber.get(start) == partitionIndex) {
                                    newRow.add(getColName(j), rows.get(start).get(targetColName));
                                } else {
                                    newRow.add(getColName(j), null);
                                }
                                break;
                            default:
                                throw new WrongWindowFunctionExpressionException("There is no window function like " + funcExpr.getName());
                        }
                    }
                }
            }
            newRows.add(newRow);
        }

        this.rows = newRows;

        //Dummy 컬럼을 제거해준다.
        if(hasDummyPartition) {
            this.dropColumn(dummyColName);
            prevDf.dropColumn(dummyColName);
        }

        LOGGER.trace("DfPivot.gather(): end: offset={} length={}", offset, length);
        return null;
    }
}


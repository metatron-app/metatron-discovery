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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        Expression partitionExpr = window.getPartition();
        Expression orderExpr = window.getOrder();
        List<Expr.FunctionExpr> functionExprList = new ArrayList<>();
        List<String> partitionColNames = new ArrayList<>();
        List<String> orderColNames = new ArrayList<>();

        // values
        if (valueExpr instanceof Expr.FunctionExpr) {
            functionExprList.add((Expr.FunctionExpr) valueExpr);
        } else if (valueExpr instanceof Expr.FunctionArrayExpr) {
            functionExprList.addAll(((Expr.FunctionArrayExpr) valueExpr).getFunctions());
        } else {
            throw new InvalidAggregationValueExpressionTypeException("doPivot(): invalid aggregation value expression type: " + valueExpr.toString());
        }

        // partition colnames
        if (partitionExpr instanceof Identifier.IdentifierExpr) {
            partitionColNames.add(((Identifier.IdentifierExpr) partitionExpr).getValue());
        } else if (partitionExpr instanceof Identifier.IdentifierArrayExpr) {
            partitionColNames.addAll(((Identifier.IdentifierArrayExpr) partitionExpr).getValue());
        } else if (partitionExpr == null) {
            partitionColNames.clear();
        } else {
            throw new InvalidColumnExpressionTypeException("doPivot(): invalid pivot column expression type: " + partitionExpr.toString());
        }

        // orderby colnames
        if (orderExpr instanceof Identifier.IdentifierExpr) {
            orderColNames.add(((Identifier.IdentifierExpr) orderExpr).getValue());
        } else if (orderExpr instanceof Identifier.IdentifierArrayExpr) {
            orderColNames.addAll(((Identifier.IdentifierArrayExpr) orderExpr).getValue());
        } else {
            throw new InvalidColumnExpressionTypeException("doPivot(): invalid pivot column expression type: " + orderExpr.toString());
        }

        preparedArgs.add(functionExprList);
        preparedArgs.add(partitionColNames);
        preparedArgs.add(orderColNames);
        return preparedArgs;
    }

    @Override
    public List<Row> gather(DataFrame prevDf, List<Object> preparedArgs, int offset, int length, int limit) throws InterruptedException, TeddyException {
        List<Expr.FunctionExpr> functionExprList = (List<Expr.FunctionExpr>) preparedArgs.get(0);
        List<Expr.FunctionExpr> aggrFunctions = new ArrayList<>();
        List<String> newColNames = new ArrayList<>();
        List<String> partitionColNames = (List<String>) preparedArgs.get(1);
        List<String> orderColNames = (List<String>) preparedArgs.get(2);

        LOGGER.trace("DfWindow.gather(): start: offset={} length={}", offset, length);

        //partition과 order에 따라 정렬한다.
        List<String> sortColNames = new ArrayList<>();
        sortColNames.addAll(partitionColNames);
        sortColNames.addAll(orderColNames);
        this.sorted(prevDf, sortColNames, SortType.ASCENDING);

        //Partition Column이 없다면 가상의 column을 만들어준다.
        Boolean hasDummyPartition = partitionColNames.isEmpty();
        if(hasDummyPartition) {
            String dummyColName = this.addColumn("dummy_Partition_Column", ColumnType.LONG);
            partitionColNames.add(dummyColName);
            for(Row row : this.rows) {
                row.add(dummyColName, 0L);
            }
        }

        //Aggregation Function과 Window Function 나눠담기.
        for (Expr.FunctionExpr func : functionExprList) {
            if("SUM, AVG, MAX, MIN, COUNT".contains(func.getName().toUpperCase())) {
                aggrFunctions.add(func);
            }
        }

        //Aggregation Function들의 값은 aggreatedDF를 만들어서 가져온다.
        DataFrame aggregatedDf = new DfAggregate(dsName, null);
        if(!aggrFunctions.isEmpty()) {
            List<String> aggrFunctionStr = new ArrayList<>();
            for (Expr.FunctionExpr func : aggrFunctions) {
                aggrFunctionStr.add(func.toString());
            }
            aggregatedDf.aggregate(this, partitionColNames, aggrFunctionStr);
        }

        //새로운 column들을 추가한다.
        for (Expr.FunctionExpr func : functionExprList) {
            int i = functionExprList.indexOf(func)+1;

            //column name
            String newColName = "window" + i + "_" + func.getName();
            if(!func.getArgs().isEmpty()) {
                newColName = newColName + "_" + func.getArgs().get(0).toString();
            }

            //column type
            ColumnType newColType = ColumnType.UNKNOWN;
            switch (func.getName()) {
                case "row_number":
                    if(func.getArgs().size()!=0)
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Invalid window function args: " + func.getName());
                    newColType = ColumnType.LONG;
                    break;
                case "rolling_avg":
                    if(func.getArgs().size()!=3)
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Invalid window function args: " + func.getName());
                    newColType = ColumnType.DOUBLE;
                    break;
                case "rolling_sum":
                    if(func.getArgs().size()!=3)
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Invalid window function args: " + func.getName());
                    newColType = prevDf.getColTypeByColName(func.getArgs().get(0).toString());
                    break;
                case "lag":
                    if(func.getArgs().size()!=2)
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Invalid window function args: " + func.getName());
                    newColType = prevDf.getColTypeByColName(func.getArgs().get(0).toString());
                    break;
                case "lead":
                    if(func.getArgs().size()!=2)
                        throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Invalid window function args: " + func.getName());
                    newColType = prevDf.getColTypeByColName(func.getArgs().get(0).toString());
                    break;
                case "sum":
                case "max":
                case "min":
                case "avg":
                case "count":
                    newColType = aggregatedDf.getColType(partitionColNames.size() + aggrFunctions.indexOf(func));
                    break;
                default:
                    throw new WrongWindowFunctionExpressionException("DfWindow.gather(): Unsupported window function: " + func.getName());
            }

            newColName = addColumn(newColName, newColType);
            newColNames.add(newColName);
        }

        //row 별로 새로운 값들 추가한다.
        Map<String, Object> partitionSet = new HashMap<>();
        List<Object> aggregatedValues = new ArrayList<>();
        List<Integer> partitionNumber = new ArrayList<>();
        int count=0;
        int partitionIndex=0;

        //각 row 별로 partition을 구분하기 위해서 리스트를 만든다.(rolling sum 등에 사용)
        for (Row row : this.rows) {
            Boolean isPartitionChanged = partitionCheck(partitionColNames, partitionSet, row);
            if (isPartitionChanged) {
                count++;
            }

            partitionNumber.add(count);
        }

        for (int i = 0; i<rows.size(); i++) {
            Row row = rows.get(i);
            //partition 변화여부 체크. 변화 했다면 partitionSet을 새로 생성하고 AggregatedValue도 새로 얻어 옴.
            if(partitionIndex != partitionNumber.get(i)) {
                partitionIndex = partitionNumber.get(i);
                count=1;
                partitionCheck(partitionColNames, partitionSet, row);
                getAggregatedValues(partitionSet, aggregatedValues, aggregatedDf);
            }

            //새로 추가해야 하는 컬럼들의 값을 채워 줌.
            for(int j = 0; j<functionExprList.size(); j++) {
                Expr.FunctionExpr func = functionExprList.get(j);
                String targetColName;
                int start;
                int end;

                //Aggregate Function 인경우의 처리. 미리 구해놓은 값을 넣어준다.
                if(aggrFunctions.contains(func)) {
                    Object value = aggregatedValues.get(aggrFunctions.indexOf(func));
                    row.add(newColNames.get(j), value);
                }
                else {//Window Function인 경우의 처리.
                    switch (func.getName()) {
                        case "row_number":
                            row.add(newColNames.get(j), (long) count++);
                            break;
                        case "rolling_sum":
                            targetColName = func.getArgs().get(0).toString();
                            start = i - func.getArgs().get(1).eval(row).asInt();
                            end = i + func.getArgs().get(2).eval(row).asInt()+1;

                            if (this.getColTypeByColName(targetColName) ==ColumnType.LONG) {
                                long value = 0L;
                                for(int k = start; k <end; k++) {
                                    if(k>=0 && k<rows.size() && partitionNumber.get(k)==partitionIndex) {
                                        value = value + (long) rows.get(k).get(targetColName);
                                    }
                                }
                                row.add(newColNames.get(j), value);
                            } else {
                                double value = 0D;
                                for(int k = start; k <end; k++) {
                                    if(k>=0 && k<rows.size() && partitionNumber.get(k)==partitionIndex) {
                                        value = value + (double) rows.get(k).get(targetColName);
                                    }
                                }
                                row.add(newColNames.get(j), value);
                            }
                            break;
                        case "rolling_avg":
                            targetColName = func.getArgs().get(0).toString();
                            start = i - func.getArgs().get(1).eval(row).asInt();
                            end = i + func.getArgs().get(2).eval(row).asInt()+1;
                            int avg_count=0;

                            if (this.getColTypeByColName(targetColName) ==ColumnType.LONG) {
                                long value = 0L;
                                for(int k = start; k <end; k++) {
                                    if(k>=0 && k<rows.size() && partitionNumber.get(k)==partitionIndex) {
                                        avg_count++;
                                        value = value + (long) rows.get(k).get(targetColName);
                                    }
                                }
                                row.add(newColNames.get(j), (double) (value/avg_count));
                            } else {
                                double value = 0D;
                                for(int k = start; k <end; k++) {
                                    if(k>=0 && k<rows.size() && partitionNumber.get(k)==partitionIndex) {
                                        avg_count++;
                                        value = value + (double) rows.get(k).get(targetColName);
                                    }
                                }
                                value=value/avg_count;
                                row.add(newColNames.get(j), value);
                            }
                            break;
                        case "lag":
                            targetColName = func.getArgs().get(0).toString();
                            start = i - func.getArgs().get(1).eval(row).asInt();

                            if (this.getColTypeByColName(targetColName) ==ColumnType.LONG) {
                                Long value = 0L;
                                if(start>=0 && partitionNumber.get(start)==partitionIndex) {
                                        value = (long) rows.get(start).get(targetColName);
                                } else {
                                    value = null;
                                }
                                row.add(newColNames.get(j), value);
                            } else {
                                Double value = 0D;
                                if(start>=0 && partitionNumber.get(start)==partitionIndex) {
                                        value = value + (double) rows.get(start).get(targetColName);
                                } else {
                                    value = null;
                                }
                                row.add(newColNames.get(j), value);
                            }
                            break;
                        case "lead":
                            targetColName = func.getArgs().get(0).toString();
                            start = i + func.getArgs().get(1).eval(row).asInt();

                            if (this.getColTypeByColName(targetColName) ==ColumnType.LONG) {
                                Long value = 0L;
                                if(start>=0 && start<rows.size() && partitionNumber.get(start)==partitionIndex) {
                                    value = (long) rows.get(start).get(targetColName);
                                } else {
                                    value = null;
                                }
                                row.add(newColNames.get(j), value);
                            } else {
                                Double value = 0D;
                                if(start>=0 && start<rows.size() && partitionNumber.get(start)==partitionIndex) {
                                    value = value + (double) rows.get(start).get(targetColName);
                                } else {
                                    value = null;
                                }
                                row.add(newColNames.get(j), value);
                            }
                            break;
                        default:
                            throw new WrongWindowFunctionExpressionException("There is no window function like " + func.getName());
                    }
                }
            }
        }

        //Dummy 컬럼을 제거해준다.
        if(hasDummyPartition) {
        }

        LOGGER.trace("DfPivot.gather(): end: offset={} length={}", offset, length);
        return null;
    }
}


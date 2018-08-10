/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.datalineage;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.util.ListUtils;

import static app.metatron.discovery.domain.datalineage.DataLineageLink.Direction.BACKWARD;
import static app.metatron.discovery.domain.datalineage.DataLineageLink.Direction.BOTH;
import static app.metatron.discovery.domain.datalineage.DataLineageLink.Direction.FORWARD;

@Service
public class DataLineageService {

  private static Logger LOGGER = LoggerFactory.getLogger(DataLineageService.class);

  @Autowired
  DataLineageRepository dataLineageRepository;

  @Autowired
  DataLineageTableRepository dataLineageTableRepository;

  public List<?> getTableList(List<DataLineage> dataLineageList, String keyword){

    HashMap<String, DataLineageDto> tableMap = new HashMap<>();
    if(dataLineageList != null){

      for(DataLineage dataLineage : dataLineageList){
        //Target Table명 확인
        String targetDatabaseName = dataLineage.getTargetDataBaseName();
        String targetTableName = dataLineage.getTargetTableName();
        String targetTableEntityName = getTableName(targetDatabaseName, targetTableName);
        if(StringUtils.containsIgnoreCase(targetTableName, keyword) && tableMap.get(targetTableEntityName) == null){
          DataLineageDto entity = new DataLineageDto(targetDatabaseName, targetTableName);
          tableMap.put(targetTableEntityName, entity);
        }

        //Target Field명 확인
        String targetFieldName = dataLineage.getTargetFieldName();
        String targetFieldType = dataLineage.getTargetFieldType();
        String targetFieldEntityName = getTableName(targetDatabaseName, targetTableName) + "." + targetFieldName;
        if(StringUtils.containsIgnoreCase(targetFieldName, keyword) && tableMap.get(targetFieldEntityName) == null){
          DataLineageDto entity = new DataLineageDto(targetDatabaseName, targetTableName, targetFieldName,
                  targetFieldType);
          tableMap.put(targetFieldEntityName, entity);
        }

        //Source Table명 확인
        String sourceDatabaseName = dataLineage.getSourceDataBaseName();
        String sourceTableName = dataLineage.getSourceTableName();
        String sourceTableEntityName = getTableName(sourceDatabaseName, sourceTableName);
        if(StringUtils.containsIgnoreCase(sourceTableName, keyword) && tableMap.get(sourceTableEntityName) == null){
          DataLineageDto entity = new DataLineageDto(sourceDatabaseName, sourceTableName);
          tableMap.put(sourceTableEntityName, entity);
        }

        //Source Field명 확인
        String sourceFieldName = dataLineage.getSourceFieldName();
        String sourceFieldType = dataLineage.getSourceFieldType();
        String sourceFieldEntityName = getTableName(sourceDatabaseName, sourceTableName) + "." + sourceFieldName;
        if(StringUtils.containsIgnoreCase(sourceFieldName, keyword) && tableMap.get(sourceFieldEntityName) == null){
          DataLineageDto entity = new DataLineageDto(sourceDatabaseName, sourceTableName, sourceFieldName,
                  sourceFieldType);
          tableMap.put(sourceFieldEntityName, entity);
        }
      }
    }

    return new ArrayList(tableMap.values());
  }

  public List<?> getTableList(List<DataLineage> dataLineageList){
    LinkedHashMap<String, DataLineageDto> tableMap = new LinkedHashMap<>();
    if(dataLineageList != null){
      for(DataLineage dataLineage : dataLineageList){
        //Target Table명 확인
        String targetDatabaseName = dataLineage.getTargetDataBaseName();
        String targetTableName = dataLineage.getTargetTableName();
        String targetTableEntityName = getTableName(targetDatabaseName, targetTableName);
        if(tableMap.get(targetTableEntityName) == null){
          DataLineageDto entity = new DataLineageDto(targetDatabaseName, targetTableName);
          tableMap.put(targetTableEntityName, entity);
        }

        //Target Field명 확인
        String targetFieldName = dataLineage.getTargetFieldName();
        String targetFieldType = dataLineage.getTargetFieldType();
        String targetFieldEntityName = getTableName(targetDatabaseName, targetTableName) + "." + targetFieldName;
        if(tableMap.get(targetFieldEntityName) == null
                && StringUtils.isNotEmpty(targetFieldName)
                && StringUtils.isNotEmpty(targetFieldType)){
          DataLineageDto entity = new DataLineageDto(targetDatabaseName, targetTableName, targetFieldName,
                  targetFieldType);
          tableMap.put(targetFieldEntityName, entity);
        }

        //Source Table명 확인
        String sourceDatabaseName = dataLineage.getSourceDataBaseName();
        String sourceTableName = dataLineage.getSourceTableName();
        String sourceTableEntityName = getTableName(sourceDatabaseName, sourceTableName);
        if(tableMap.get(sourceTableEntityName) == null){
          DataLineageDto entity = new DataLineageDto(sourceDatabaseName, sourceTableName);
          tableMap.put(sourceTableEntityName, entity);
        }

        //Source Field명 확인
        String sourceFieldName = dataLineage.getSourceFieldName();
        String sourceFieldType = dataLineage.getSourceFieldType();
        String sourceFieldEntityName = getTableName(sourceDatabaseName, sourceTableName) + "." + sourceFieldName;
        if(tableMap.get(sourceFieldEntityName) == null
                && StringUtils.isNotEmpty(sourceFieldName)
                && StringUtils.isNotEmpty(sourceFieldType)){
          DataLineageDto entity = new DataLineageDto(sourceDatabaseName, sourceTableName, sourceFieldName,
                  sourceFieldType);
          tableMap.put(sourceFieldEntityName, entity);
        }
      }
    }

    List<DataLineageDto> tableList = new ArrayList(tableMap.values());
    tableList.sort((entity1, entity2) -> entity1.compareTo(entity2));
    return tableList;
  }

  public List<?> getSQLList(List<DataLineage> dataLineageList){

    HashMap<String, DataLineageDto> sqlMap = new HashMap<>();
    if(dataLineageList != null){
      for(DataLineage dataLineage : dataLineageList){
        //SQL
        String sqlQuery = dataLineage.getSqlQuery();
        if(sqlMap.get(sqlQuery) == null){
          DataLineageDto entity = new DataLineageDto(dataLineage.getId(), dataLineage.getSqlQuery()
                  , dataLineage.getTimestamp(), dataLineage.getSqlFile());
          sqlMap.put(sqlQuery, entity);
        }
      }
    }

    return new ArrayList(sqlMap.values());
  }

  public DataLineageLink getLinkedEntity(Long dataLineageId, DataLineageLink.Direction direction,
                                               DateTime from, DateTime to) {
    DataLineage dataLineage = dataLineageRepository.getOne(dataLineageId);

    List<DataLineage> dataLineages = dataLineageRepository.getDataLineageWithWorkflow(dataLineage.getSqlId());
    DataLineageLink dataLineageLink = generateDataLineageLink(dataLineages, direction);

    DataLineageLink arrangedDataLineageLink = arrangePositionBySQL(dataLineageLink, dataLineage, dataLineage.getSqlQuery());
    return arrangedDataLineageLink;
  }

  public DataLineageLink getLinkedEntity(String dbName, String tableName, DataLineageLink.Direction direction,
                                               DateTime from, DateTime to) {
    DataLineageLink dataLineageLink = null;
    switch (direction){
      case BOTH:
        List<DataLineage> dataLineages = new ArrayList<>();
        dataLineages.addAll(dataLineageRepository.getDataLineageWithWorkflowForward(dbName, tableName));
        dataLineages.addAll(dataLineageRepository.getDataLineageWithWorkflowBackward(dbName, tableName));
        dataLineageLink = generateDataLineageLink(dataLineages, DataLineageLink.Direction.BOTH);
        break;
      case FORWARD:
        dataLineageLink = getForwardLinkedEntity(dbName, tableName, from, to);
        break;
      case BACKWARD:
        dataLineageLink = getBackwardLinkedEntity(dbName, tableName, from, to);
        break;
    }

    DataLineageLink arrangedDataLineageLink = arrangePositionByTable(dataLineageLink, dbName, tableName);

    return arrangedDataLineageLink;
  }

  public DataLineageLink getForwardLinkedEntity(String dbName, String tableName, DateTime from, DateTime to) {
    List<DataLineage> dataLineages = dataLineageRepository.getDataLineageWithWorkflowForward(dbName, tableName);
    DataLineageLink dataLineageLink = generateDataLineageLink(dataLineages, DataLineageLink.Direction.FORWARD);
    return dataLineageLink;
  }

  public DataLineageLink getBackwardLinkedEntity(String dbName, String tableName, DateTime from, DateTime to) {
    List<DataLineage> dataLineages = dataLineageRepository.getDataLineageWithWorkflowBackward(dbName, tableName);
    DataLineageLink dataLineageLink = generateDataLineageLink(dataLineages, DataLineageLink.Direction.BACKWARD);
    return dataLineageLink;
  }

  private DataLineageLink generateDataLineageLink(List<DataLineage> dataLineageList, DataLineageLink.Direction direction){
    DataLineageLink dataLineageLink = new DataLineageLink();

    Map<String, DataLineageLinkedQuery> queryMap = new HashMap<>();
    Map<String, DataLineageLinkedTable> tableMap = new HashMap<>();

    List<DataLineageLinkedEntity> entityList = new ArrayList<>();
    List<DataLineageLinkedQuery> queryList = new ArrayList<>();
    List<DataLineageLinkedTable> tableList = new ArrayList<>();
    List<DataLineageLinkedEdge> edgeList = new ArrayList<>();

    for(DataLineage dataLineage : dataLineageList){
      //Query 객체 생성
      String sqlQuery = dataLineage.getSqlQuery();
      DataLineageLinkedQuery dataLineageLinkedQuery = queryMap.get(sqlQuery);
      if(dataLineageLinkedQuery == null){
        dataLineageLinkedQuery = new DataLineageLinkedQuery();
        dataLineageLinkedQuery.setName(sqlQuery);
        dataLineageLinkedQuery.setSqlFile(dataLineage.getSqlFile());
        dataLineageLinkedQuery.setDataLineageId(dataLineage.getId());
        dataLineageLinkedQuery.setTimestamp(dataLineage.getTimestamp());
        dataLineageLinkedQuery.setWorkFlowId(dataLineage.getWorkFlowId());
        dataLineageLinkedQuery.setWorkFlowName(dataLineage.getWorkFlowName());
        queryMap.put(sqlQuery, dataLineageLinkedQuery);
        queryList.add(dataLineageLinkedQuery);
      }

      //Predicate 목록 생성
      if(dataLineage.isPredicate()){
        if(dataLineageLinkedQuery.getPredicates() == null){
          dataLineageLinkedQuery.setPredicates(new ArrayList<>());
        }
        List<String> predicates = dataLineageLinkedQuery.getPredicates();
        String predicateStr = dataLineage.getPredicateStr();
        if(!containsString(predicateStr, predicates)){
          predicates.add(predicateStr);
        }
      }

      //Table 생성(backward)
      if(direction == BOTH || direction == BACKWARD){
        String dbName = dataLineage.getSourceDataBaseName();
        String tableName = dataLineage.getSourceTableName();
        if(StringUtils.isNotEmpty(tableName)){
          String linkedTableName = getTableName(dbName, tableName);
          DataLineageLinkedTable dataLineageLinkedTable = tableMap.get(linkedTableName);
          if (dataLineageLinkedTable == null) {
            dataLineageLinkedTable = new DataLineageLinkedTable();
            dataLineageLinkedTable.setName(linkedTableName);
            dataLineageLinkedTable.setDatabaseName(dbName);
            dataLineageLinkedTable.setTableName(tableName);
            tableMap.put(linkedTableName, dataLineageLinkedTable);
            tableList.add(dataLineageLinkedTable);
          }
          if(StringUtils.isNotEmpty(dataLineage.getSourceFieldName())){
            //Column 목록 생성
            if(dataLineageLinkedTable.getColumns() == null){
              dataLineageLinkedTable.setColumns(new ArrayList<>());
            }
            List<DataLineageLinkedColumn> columnList = dataLineageLinkedTable.getColumns();

            DataLineageLinkedColumn column = new DataLineageLinkedColumn();
            column.setName(dataLineage.getSourceFieldName());
            column.setType(dataLineage.getSourceFieldType());
            column.setComment(dataLineage.getSourceFieldComment());

            boolean hasColumn = columnList.stream()
                    .anyMatch(col -> col.getName().equals(dataLineage.getSourceFieldName()));

            if(!hasColumn){
              columnList.add(column);
            }
          }
        }
      }

      //Table 생성(Forward)
      if(direction == BOTH || direction == FORWARD) {
        String dbName = dataLineage.getTargetDataBaseName();
        String tableName = dataLineage.getTargetTableName();
        if(StringUtils.isNotEmpty(tableName)){
          String linkedTableName = getTableName(dbName, tableName);
          DataLineageLinkedTable dataLineageLinkedTable = tableMap.get(linkedTableName);
          if (dataLineageLinkedTable == null) {
            dataLineageLinkedTable = new DataLineageLinkedTable();
            dataLineageLinkedTable.setName(linkedTableName);
            dataLineageLinkedTable.setDatabaseName(dbName);
            dataLineageLinkedTable.setTableName(tableName);
            tableMap.put(linkedTableName, dataLineageLinkedTable);
            tableList.add(dataLineageLinkedTable);
          }
          if(StringUtils.isNotEmpty(dataLineage.getTargetFieldName())){
            //Column 목록 생성
            if(dataLineageLinkedTable.getColumns() == null){
              dataLineageLinkedTable.setColumns(new ArrayList<>());
            }
            List<DataLineageLinkedColumn> columnList = dataLineageLinkedTable.getColumns();

            DataLineageLinkedColumn column = new DataLineageLinkedColumn();
            column.setName(dataLineage.getTargetFieldName());
            column.setType(dataLineage.getTargetFieldType());
            column.setComment(dataLineage.getTargetFieldComment());

            boolean hasColumn = columnList.stream()
                    .anyMatch(col -> col.getName().equals(dataLineage.getTargetFieldName()));

            if(!hasColumn){
              columnList.add(column);
            }
          }
        }
      }

      //Edge(Column) 생성
      String fromTable = getTableName(dataLineage.getSourceDataBaseName(), dataLineage.getSourceTableName());
      String toTable = getTableName(dataLineage.getTargetDataBaseName(), dataLineage.getTargetTableName());
      DataLineageLinkedEdge dataLineageLinkedEdge = new DataLineageLinkedEdge();
      dataLineageLinkedEdge.setFromTable(fromTable);
      dataLineageLinkedEdge.setFromColumn(dataLineage.getSourceFieldName());
      dataLineageLinkedEdge.setToTable(toTable);
      dataLineageLinkedEdge.setToColumn(dataLineage.getTargetFieldName());
      dataLineageLinkedEdge.setPath(dataLineageLinkedQuery.getName());
      dataLineageLinkedEdge.setPredicate(dataLineage.getPredicateStr());
      dataLineageLinkedEdge.setSqlFile(dataLineage.getSqlFile());
      dataLineageLinkedEdge.setWorkflowName(dataLineage.getWorkFlowName());
      dataLineageLinkedEdge.setWorkflowId(dataLineage.getWorkFlowId());
      edgeList.add(dataLineageLinkedEdge);
    }

    //Edge(Table) 생성
    List<DataLineageLinkedEdge> distinctEdgeList = ListUtils.distinctList(edgeList, DataLineageLinkedEdge::getFromTable,
            DataLineageLinkedEdge::getToTable, DataLineageLinkedEdge::getPath);
    distinctEdgeList.stream().forEach(edge -> {
      DataLineageLinkedEdge dataLineageLinkedEdge = new DataLineageLinkedEdge();
      dataLineageLinkedEdge.setFromTable(edge.getFromTable());
      dataLineageLinkedEdge.setToTable(edge.getToTable());
      dataLineageLinkedEdge.setPath(edge.getPath());
      dataLineageLinkedEdge.setSqlFile(edge.getSqlFile());
      dataLineageLinkedEdge.setWorkflowName(edge.getWorkflowName());
      dataLineageLinkedEdge.setWorkflowId(edge.getWorkflowId());
      edgeList.add(dataLineageLinkedEdge);
    });

    dataLineageLink.setQueries(queryList);
    dataLineageLink.setTables(tableList);
    entityList.addAll(queryList);
    entityList.addAll(tableList);
    dataLineageLink.setEntities(entityList);
    dataLineageLink.setEdges(edgeList);
    dataLineageLink.setDirection(direction);

    DateTime from = null;
    DateTime to = null;
    for(DataLineage dataLineage : dataLineageList){
      if(from == null || from.toDate().getTime() > dataLineage.getTimestamp().toDate().getTime()){
        from = dataLineage.getTimestamp();
      }

      if(to == null || to.toDate().getTime() < dataLineage.getTimestamp().toDate().getTime()){
        to = dataLineage.getTimestamp();
      }
    }
    dataLineageLink.setFrom(from);
    dataLineageLink.setTo(to);
    return dataLineageLink;
  }

  private boolean containsString(String targetStr, List<String> strList){
    return strList.stream().anyMatch(str -> str.equals(targetStr));
  }

  private DataLineageLink arrangePositionByTable(DataLineageLink dataLineageLink, String databaseName, String tableName){

    //정렬 기준 (가운데)
    final String sortByName = getTableName(databaseName, tableName);

    List<DataLineageLinkedTable> tables = dataLineageLink.getTables();
    List<DataLineageLinkedQuery> queries = dataLineageLink.getQueries();
    List<DataLineageLinkedEdge> edges = dataLineageLink.getEdges();

    List<DataLineageLinkedTable> filteredTables = tables.stream()
            .filter(table -> table.getDatabaseName().equals(databaseName) && table.getTableName().equalsIgnoreCase(tableName))
            .collect(Collectors.toList());

    DataLineageLinkedTable sortBy = null;
    if(filteredTables.size() > 0){
      sortBy = filteredTables.get(0);
      sortBy.setxPos(2);
      sortBy.setyPos(0);
    }

    //첫 시작은 0, 0
    int minXPos = 0;
    int currentXPos = (sortBy == null ? 0 : sortBy.getxPos());

    //정렬기준 왼쪽 Entity Position Start

    //정렬기준 왼쪽 Edge List
    List<DataLineageLinkedEdge> filteredLeftEdges = edges.stream()
            .filter(edge -> edge.getToColumn() == null && edge.getToTable().equalsIgnoreCase(sortByName))
            .collect(Collectors.toList());

    //정렬기준 왼쪽 Edge List의 Path에 해당하는 Sql Name List
    List<String> leftQueryNameList = filteredLeftEdges.stream()
            .map(edge -> edge.getPath())
            .collect(Collectors.toList());

    List<DataLineageLinkedQuery> filteredLeftQueries = queries.stream()
            .filter(query -> leftQueryNameList.contains(query.getName()))
            .collect(Collectors.toList());

    int queryYPos = 0;
    int tableYPos = 0;

    for(DataLineageLinkedQuery leftQuery : filteredLeftQueries){
      currentXPos = (sortBy == null ? -1 : sortBy.getxPos() - 1);
      //Position 할당은 최초 한번만
      if(leftQuery.getyPos() == -9999){
        leftQuery.setxPos(currentXPos);
        leftQuery.setyPos(queryYPos++);
        minXPos = Math.min(minXPos, leftQuery.getxPos());
      }

      //정렬기준 왼쪽 Edge List의 From에 해당하는 tableName List
      List<String> leftTableNameList = filteredLeftEdges.stream()
              .filter(edge -> edge.getPath().equals(leftQuery.getName()))
              .map(edge -> edge.getFromTable())
              .collect(Collectors.toList());

      List<DataLineageLinkedTable> filteredLeftTables = tables.stream()
              .filter(table -> {
                String linkedTableName = getTableName(table.getDatabaseName(), table.getTableName());
                return leftTableNameList.contains(linkedTableName);
              })
              .collect(Collectors.toList());

      //Table 최초 Y Position은 Query Y Position 기준
      if(filteredLeftTables.size() > 0){
        tableYPos = leftQuery.getyPos();
        for(DataLineageLinkedTable leftTable : filteredLeftTables) {
          //Position 할당은 최초 한번만
          if (leftTable.getyPos() == -9999) {
            leftTable.setxPos(leftQuery.getxPos() - 1);
            leftTable.setyPos(tableYPos++);
            minXPos = Math.min(minXPos, leftTable.getxPos());

            //다음 Query Y Position은 Table Y Postion 다음 좌표로.
            queryYPos = tableYPos;
          }
        }
      }
    }

    //정렬기준 오른쪽 Entity Position Start

    //정렬기준 오른쪽 Edge List
    List<DataLineageLinkedEdge> filteredRightEdges = edges.stream()
            .filter(edge -> edge.getFromColumn() == null && edge.getFromTable().equalsIgnoreCase(sortByName))
            .collect(Collectors.toList());

    //정렬기준 오른쪽 Edge List의 Path에 해당하는 Sql Name List
    List<String> rightQueryNameList = filteredRightEdges.stream()
            .map(edge -> edge.getPath())
            .collect(Collectors.toList());

    List<DataLineageLinkedQuery> filteredRightQueries = queries.stream()
            .filter(query -> rightQueryNameList.contains(query.getName()))
            .collect(Collectors.toList());

    queryYPos = 0;
    tableYPos = 0;

    for(DataLineageLinkedQuery rightQuery : filteredRightQueries){
      currentXPos = (sortBy == null ? 1 : sortBy.getxPos() + 1);
      //Position 할당은 최초 한번만
      if(rightQuery.getyPos() == -9999){
        rightQuery.setxPos(currentXPos);
        rightQuery.setyPos(queryYPos++);
        minXPos = Math.min(minXPos, rightQuery.getxPos());
      }

      //정렬기준 오른쪽 Edge List의 To에 해당하는 tableName List
      List<String> rightTableNameList = filteredRightEdges.stream()
              .filter(edge -> edge.getPath().equals(rightQuery.getName()))
              .map(edge -> edge.getToTable())
              .collect(Collectors.toList());

      List<DataLineageLinkedTable> filteredRightTables = tables.stream()
              .filter(table -> {
                String linkedTableName = getTableName(table.getDatabaseName(), table.getTableName());
                return rightTableNameList.contains(linkedTableName);
              })
              .collect(Collectors.toList());

      //Table 최초 Y Position은 Query Y Position 기준
      if(filteredRightTables.size() > 0){
        tableYPos = rightQuery.getyPos();
        for(DataLineageLinkedTable rightTable : filteredRightTables) {
          //Position 할당은 최초 한번만
          if (rightTable.getyPos() == -9999) {
            rightTable.setxPos(rightQuery.getxPos() + 1);
            rightTable.setyPos(tableYPos++);
            minXPos = Math.min(minXPos, rightTable.getxPos());
            //다음 Query Y Position은 Table Y Postion 다음 좌표로.
            queryYPos = tableYPos;
          }
        }
      }
    }

    //좌표 0 부터 시작하게 보정
    final int xPosConstant = minXPos * -1;
    dataLineageLink.getEntities().forEach(entity -> entity.setxPos(entity.getxPos() + xPosConstant));

    //좌표가 -9999인 엔티티 제거
    dataLineageLink.setEntities(dataLineageLink.getEntities().stream()
            .filter(entity -> !(entity.getxPos() < 0 || entity.getyPos() < 0) )
            .collect(Collectors.toList()));

    return dataLineageLink;
  }

  private DataLineageLink arrangePositionBySQL(DataLineageLink dataLineageLink, DataLineage dataLineage, String sqlQuery){

    //정렬 기준 (가운데)

    List<DataLineageLinkedTable> tables = dataLineageLink.getTables();
    List<DataLineageLinkedQuery> queries = dataLineageLink.getQueries();
    List<DataLineageLinkedEdge> edges = dataLineageLink.getEdges();

    List<DataLineageLinkedQuery> filteredQueries = queries.stream()
            .filter(query -> query.getName().equals(sqlQuery))
            .collect(Collectors.toList());

    int minXPos = 0;
    if(filteredQueries.size() > 0){
      DataLineageLinkedQuery sortBy = filteredQueries.get(0);
      //첫 시작은 0, 0
      sortBy.setxPos(0);
      sortBy.setyPos(0);
    }

    int currentYPos = 0;

    //해당 Query의 From Table 가져오기
    for(DataLineageLinkedEdge edge : edges){
      String fromTableName = edge.getFromTable();
      List<DataLineageLinkedTable> filteredLeftTables = tables.stream()
              .filter(table -> table.getName().equals(fromTableName))
              .collect(Collectors.toList());
      if(filteredLeftTables.size() > 0){
        for(DataLineageLinkedTable leftTable : filteredLeftTables){
          if(leftTable.getyPos() == -9999){
            leftTable.setxPos(-1);
            leftTable.setyPos(currentYPos++);
            minXPos = Math.min(minXPos, leftTable.getxPos());
          }
        }
      } else {
        currentYPos++;
      }
    }

    //해당 Query의 To Table 가져오기
    currentYPos = 0;
    for(DataLineageLinkedEdge edge : edges){
      String toTableName = edge.getToTable();
      List<DataLineageLinkedTable> filteredRightTables = tables.stream()
              .filter(table -> table.getName().equals(toTableName))
              .collect(Collectors.toList());
      if(filteredRightTables.size() > 0){
        for(DataLineageLinkedTable rightTable : filteredRightTables){
          if(rightTable.getyPos() == -9999){
            rightTable.setxPos(1);
            rightTable.setyPos(currentYPos++);
          }
        }
      } else {
        currentYPos++;
      }
    }

    //좌표 0 부터 시작하게 보정
    final int xPosConstant = minXPos * -1;
    dataLineageLink.getEntities().forEach(entity -> entity.setxPos(entity.getxPos() + xPosConstant));
    return dataLineageLink;
  }

  public HashMap<String, Object> getTableInformation(String schemaName, String tableName){
    LinkedHashMap<String, Object> tableInformation = new LinkedHashMap<>();

    List<HashMap> columnList = new ArrayList<>();
    tableInformation.put("columns", columnList);

    List<HashMap> detailInfoList = new ArrayList<>();
    tableInformation.put("detailed", detailInfoList);

    List<HashMap> storageInfoList = new ArrayList<>();
    tableInformation.put("storage", storageInfoList);

    List<DataLineageTable> dataLineageTables =
            dataLineageTableRepository.findBySchemaNameIgnoreCaseAndTableNameIgnoreCase(schemaName, tableName);
    for(DataLineageTable dataLineageTable : dataLineageTables){
      //Column 정보
      if(dataLineageTable.getInfoType() == DataLineageTable.InfoType.COLUMN){
        LinkedHashMap<String, String> columnMap = new LinkedHashMap<>();
        columnMap.put("schema", dataLineageTable.getSchemaName());
        columnMap.put("table", dataLineageTable.getTableName());
        columnMap.put("columnName", dataLineageTable.getColName());
        columnMap.put("columnType", dataLineageTable.getDataType());
        columnMap.put("comment", dataLineageTable.getComment());
        columnList.add(columnMap);
      }

      if(dataLineageTable.getInfoType() == DataLineageTable.InfoType.DETAILED){
        LinkedHashMap<String, String> detailMap = new LinkedHashMap<>();
        detailMap.put("column1", dataLineageTable.getColName());
        detailMap.put("column2", dataLineageTable.getDataType());
        detailMap.put("column3", dataLineageTable.getComment());
        detailInfoList.add(detailMap);
      }

      if(dataLineageTable.getInfoType() == DataLineageTable.InfoType.STORAGE){
        LinkedHashMap<String, String> storageMap = new LinkedHashMap<>();
        storageMap.put("column1", dataLineageTable.getColName());
        storageMap.put("column2", dataLineageTable.getDataType());
        storageMap.put("column3", dataLineageTable.getComment());
        storageInfoList.add(storageMap);
      }
    }
    return tableInformation;
  }

  public List<DataLineageLink> getLinkedEntityByDepth(String dbName, String tableName, DateTime from, DateTime to, int depth) {
    LOGGER.debug("getLinkedEntityByDepth Depth = " + depth);

    List<DataLineageLink> dataLineageLinks = new ArrayList<>();

    //최대 Loop Cnt
    final int limitLoopCnt = 999;

    //조사대상 Table 정보
    List<DataLineageLinkedTable> forwardTargetTableList = new ArrayList<>();
    forwardTargetTableList.add(new DataLineageLinkedTable(dbName, tableName));

    LOGGER.debug("Search Start(Forward)");
    //Depth가 1보다 클 경우
    if(depth > 0){
      int recursiveLoopCnt = 0;
      while(depth > recursiveLoopCnt && recursiveLoopCnt < limitLoopCnt){
        LOGGER.debug("Recursive Search Started...Depth Count(Forward) = " + recursiveLoopCnt);
        LOGGER.debug("Search Table List Size(Forward) = " + forwardTargetTableList.size());

        final List<DataLineage> foundDataLineageList = new ArrayList<>();

        //조사 대상 DataBase, Table 배열
        for (DataLineageLinkedTable dataLineageLinkedTable : forwardTargetTableList) {
          String targetDatabaseName = dataLineageLinkedTable.getDatabaseName();
          String targetTableName = dataLineageLinkedTable.getTableName();

          //Forward 목록 가져오기 Recursive
          LOGGER.debug("Recursive Method Call(Forward) = " + getTableName(targetDatabaseName, targetTableName));
          List<DataLineage> forwardList = getDataLineageListByTableAndDirection(targetDatabaseName, targetTableName,
                  from, to, DataLineageLink.Direction.FORWARD);

          if(forwardList != null && forwardList.size() > 0) {
            foundDataLineageList.addAll(forwardList);
          }
        }

        //모든 테이블 대상 조사 후 더이상 Lineage 연결이 없을 경우 Break.
        if(foundDataLineageList == null || foundDataLineageList.size() == 0){
          LOGGER.debug("Not found Linked Lineage (Forward)...");
          break;
        }
        LOGGER.debug("Found List size(Forward) = " + foundDataLineageList.size());
        //DataLineageLink 목록에 추가함
        dataLineageLinks.add(generateDataLineageLink(foundDataLineageList, DataLineageLink.Direction.FORWARD));

        //다음 Search를 위해 테이블 목록 추출
        List<DataLineage> distinctDataLineageList = ListUtils.distinctList(foundDataLineageList, DataLineage::getTargetDataBaseName,
                DataLineage::getTargetTableName, DataLineage::getSqlQuery);

        LOGGER.debug("Distinct List(Forward) = " + distinctDataLineageList.size());

        final List<DataLineageLinkedTable> nextTableList = new ArrayList<>();
        distinctDataLineageList.stream().forEach(dataLineage -> {
          String targetDatabaseName = dataLineage.getTargetDataBaseName();
          String targetTableName = dataLineage.getTargetTableName();
          LOGGER.debug("Next Search Table = " + getTableName(targetDatabaseName, targetTableName));
          nextTableList.add(new DataLineageLinkedTable(targetDatabaseName, targetTableName));
        });

        forwardTargetTableList = nextTableList;
        recursiveLoopCnt++;
      }
    }
    LOGGER.debug("Search End(Forward)");


    LOGGER.debug("Search Start(Backward)");
    //조사대상 Table 정보
    List<DataLineageLinkedTable> backwardTargetTableList = new ArrayList<>();
    backwardTargetTableList.add(new DataLineageLinkedTable(dbName, tableName));

    //Depth가 1보다 클 경우
    if(depth > 0){
      int recursiveLoopCnt = 0;
      while(depth > recursiveLoopCnt && recursiveLoopCnt < limitLoopCnt){
        LOGGER.debug("Recursive Search Started...Depth Count(Backward) = " + recursiveLoopCnt);
        LOGGER.debug("Search Table List Size(Backward) = " + backwardTargetTableList.size());

        final List<DataLineage> foundDataLineageList = new ArrayList<>();

        //조사 대상 DataBase, Table 배열
        for (DataLineageLinkedTable dataLineageLinkedTable : backwardTargetTableList) {
          String sourceDatabaseName = dataLineageLinkedTable.getDatabaseName();
          String sourceTableName = dataLineageLinkedTable.getTableName();

          //Forward 목록 가져오기 Recursive
          LOGGER.debug("Recursive Method Call(Backward) = " + getTableName(sourceDatabaseName, sourceTableName));
          List<DataLineage> backwardList = getDataLineageListByTableAndDirection(sourceDatabaseName, sourceTableName,
                  from, to, DataLineageLink.Direction.BACKWARD);

          if(backwardList != null && backwardList.size() > 0) {
            foundDataLineageList.addAll(backwardList);
          }
        }

        //모든 테이블 대상 조사 후 더이상 Lineage 연결이 없을 경우 Break.
        if(foundDataLineageList == null || foundDataLineageList.size() == 0){
          LOGGER.debug("Not found Linked Lineage (Backward)...");
          break;
        }
        LOGGER.debug("Found List size(Backward) = " + foundDataLineageList.size());
        //DataLineageLink 목록에 추가함
        dataLineageLinks.add(0, generateDataLineageLink(foundDataLineageList, DataLineageLink.Direction.BACKWARD));

        //다음 Search를 위해 테이블 목록 추출
        List<DataLineage> distinctDataLineageList = ListUtils.distinctList(foundDataLineageList, DataLineage::getSourceDataBaseName,
                DataLineage::getSourceTableName, DataLineage::getSqlQuery);

        LOGGER.debug("Distinct List(Backward) = " + distinctDataLineageList.size());

        final List<DataLineageLinkedTable> nextTableList = new ArrayList<>();
        distinctDataLineageList.stream().forEach(dataLineage -> {
          String sourceDatabaseName = dataLineage.getSourceDataBaseName();
          String sourceTableName = dataLineage.getSourceTableName();
          LOGGER.debug("Next Search Table = " + getTableName(sourceDatabaseName, sourceTableName));
          nextTableList.add(new DataLineageLinkedTable(sourceDatabaseName, sourceTableName));
        });

        backwardTargetTableList = nextTableList;
        recursiveLoopCnt++;
      }
    }
    LOGGER.debug("Search End(Backward)");

    for(DataLineageLink dataLineageLink : dataLineageLinks){
      arrangePositionByTable(dataLineageLink, dbName, tableName);
    }
    return dataLineageLinks;
  }

  private List<DataLineage> getDataLineageListByTableAndDirection(String dbName, String tableName, DateTime from, DateTime to, DataLineageLink.Direction direction){
    List<DataLineage> dataLineages;
    if(direction == FORWARD){
      dataLineages = dataLineageRepository.getDataLineageWithWorkflowForward(dbName, tableName);
    } else {
      dataLineages = dataLineageRepository.getDataLineageWithWorkflowBackward(dbName, tableName);
    }
    return dataLineages;
  }
  
  private String getTableName(String databaseName, String tableName){
    return StringUtils.isNotEmpty(databaseName)
            ? databaseName + "." + tableName
            : tableName;
  }
}

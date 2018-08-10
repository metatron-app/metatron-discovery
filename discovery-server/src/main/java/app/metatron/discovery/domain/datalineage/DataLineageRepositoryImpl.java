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

import com.google.common.collect.Lists;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.DateTimePath;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.NumberPath;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.sql.Configuration;
import com.querydsl.sql.MySQLTemplates;
import com.querydsl.sql.SQLExpressions;
import com.querydsl.sql.SQLQuery;
import com.querydsl.sql.SQLQueryFactory;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.util.List;
import java.util.stream.Collectors;

import javax.persistence.Query;
import javax.sql.DataSource;

@Transactional
public class DataLineageRepositoryImpl extends QueryDslRepositorySupport implements DataLineageRepositoryCustom{

  public DataLineageRepositoryImpl() {
    super(DataLineage.class);
  }

  @Autowired
  DataSource dataSource;

  @Override
  public Page<DataLineageDto> getTableList(String tableName, Pageable pageable) {
    QDataLineage qDataLineage = new QDataLineage("data_lineage");

    StringPath sqlTypePath = Expressions.stringPath("sql_type");

    StringPath targetDbName = Expressions.stringPath("target_db_name");
    StringPath targetTbName = Expressions.stringPath("target_tb_name");
    StringPath sourceDbName = Expressions.stringPath("source_db_name");
    StringPath sourceTbName = Expressions.stringPath("source_tb_name");
    StringPath sqlFilePath = Expressions.stringPath("sql_file");

    StringPath dbNameAliasPath = Expressions.stringPath("dbName");
    StringPath tableNameAliasPath = Expressions.stringPath("tableName");

    SQLQueryFactory queryFactory = new SQLQueryFactory(new Configuration(new MySQLTemplates()), dataSource);

    JPQLQuery targetTableQuery = from(qDataLineage)
            .select(targetDbName.as(dbNameAliasPath), targetTbName.as(tableNameAliasPath))
            .where(sqlTypePath.in(
                    DataLineage.SqlType.CREATETABLE_AS_SELECT.toString()
                    , DataLineage.SqlType.INSERT.toString()
                    , DataLineage.SqlType.PATH_WRITE.toString()
                    , DataLineage.SqlType.INSERT_OVERWRITE.toString()
                    )
                    .and(targetDbName.isNotEmpty())
//                    .and(sqlFilePath.isNotEmpty().and(sqlFilePath.isNotNull()))
            )
            .distinct();
    JPQLQuery sourceTableQuery = from(qDataLineage)
            .select(sourceDbName.as(dbNameAliasPath), sourceTbName.as(tableNameAliasPath))
            .where(sqlTypePath.in(
                    DataLineage.SqlType.CREATETABLE_AS_SELECT.toString()
                    , DataLineage.SqlType.INSERT.toString()
                    , DataLineage.SqlType.PATH_WRITE.toString()
                    , DataLineage.SqlType.INSERT_OVERWRITE.toString()
                    )
                    .and(sourceDbName.isNotEmpty())
//                    .and(sqlFilePath.isNotEmpty().and(sqlFilePath.isNotNull()))
            )
            .distinct();

    if(StringUtils.isNotEmpty(tableName)){
      targetTableQuery.where(targetTbName.containsIgnoreCase(tableName));
      sourceTableQuery.where(sourceTbName.containsIgnoreCase(tableName));
    }

    SQLQuery countQuery = queryFactory
            .select(Projections.constructor(DataLineageDto.class, dbNameAliasPath, tableNameAliasPath))
            .from(SQLExpressions.union(targetTableQuery, sourceTableQuery).as("t1"));

    SQLQuery listQuery = queryFactory
            .select(Projections.constructor(DataLineageDto.class, dbNameAliasPath, tableNameAliasPath))
            .from(SQLExpressions.union(targetTableQuery, sourceTableQuery).as("t1"))
            .orderBy(tableNameAliasPath.asc());

    if(pageable != null){
      //Pagination 적용
      listQuery.offset((long)pageable.getOffset());
      listQuery.limit((long)pageable.getPageSize());
    }

    Long total = countQuery.fetchCount();
    List<DataLineageDto> content = total > pageable.getOffset() ? listQuery.fetch() : Lists.newArrayList();
    return new PageImpl<>(content, pageable, total);
  }

  @Override
  public Page<DataLineageDto> getColumnList(String columnName, Pageable pageable) {
    QDataLineage qDataLineage = new QDataLineage("data_lineage");

    StringPath sqlTypePath = Expressions.stringPath("sql_type");

    StringPath targetDbName = Expressions.stringPath("target_db_name");
    StringPath targetTbName = Expressions.stringPath("target_tb_name");
    StringPath targetFieldName = Expressions.stringPath("target_field_name");
    StringPath targetFieldType = Expressions.stringPath("target_field_type");

    StringPath sourceDbName = Expressions.stringPath("source_db_name");
    StringPath sourceTbName = Expressions.stringPath("source_tb_name");
    StringPath sourceFieldName = Expressions.stringPath("source_field_name");
    StringPath sourceFieldType = Expressions.stringPath("source_field_type");

    StringPath sqlFilePath = Expressions.stringPath("sql_file");

    StringPath dbNameAliasPath = Expressions.stringPath("dbName");
    StringPath tableNameAliasPath = Expressions.stringPath("tableName");
    StringPath fieldNameAliasPath = Expressions.stringPath("fieldName");
    StringPath fieldTypeAliasPath = Expressions.stringPath("fieldType");

    SQLQueryFactory queryFactory = new SQLQueryFactory(new Configuration(new MySQLTemplates()), dataSource);

    JPQLQuery targetColumnQuery = from(qDataLineage)
            .select(targetDbName.as(dbNameAliasPath), targetTbName.as(tableNameAliasPath)
                    , targetFieldName.as(fieldNameAliasPath), targetFieldType.as(fieldTypeAliasPath))
            .where(sqlTypePath.in(
                    DataLineage.SqlType.CREATETABLE_AS_SELECT.toString()
                    , DataLineage.SqlType.INSERT.toString()
                    , DataLineage.SqlType.PATH_WRITE.toString()
                    , DataLineage.SqlType.INSERT_OVERWRITE.toString())
//                    .and(sqlFilePath.isNotEmpty().and(sqlFilePath.isNotNull()))
                    .and(targetFieldName.isNotEmpty())
                    .and(targetDbName.isNotEmpty())
            )
            .distinct();
    JPQLQuery sourceColumnQuery = from(qDataLineage)
            .select(sourceDbName.as(dbNameAliasPath), sourceTbName.as(tableNameAliasPath)
                    , sourceFieldName.as(fieldNameAliasPath), sourceFieldType.as(fieldTypeAliasPath))
            .where(sqlTypePath.in(
                    DataLineage.SqlType.CREATETABLE_AS_SELECT.toString()
                    , DataLineage.SqlType.INSERT.toString()
                    , DataLineage.SqlType.PATH_WRITE.toString()
                    , DataLineage.SqlType.INSERT_OVERWRITE.toString())
//                    .and(sqlFilePath.isNotEmpty().and(sqlFilePath.isNotNull()))
                    .and(sourceFieldName.isNotEmpty())
                    .and(sourceDbName.isNotEmpty())
            )
            .distinct();

    if(StringUtils.isNotEmpty(columnName)){
      targetColumnQuery.where(targetFieldName.containsIgnoreCase(columnName));
      sourceColumnQuery.where(sourceFieldName.containsIgnoreCase(columnName));
    }

    SQLQuery countQuery = queryFactory
            .select(Projections.constructor(DataLineageDto.class, dbNameAliasPath, tableNameAliasPath
                    , fieldNameAliasPath, fieldTypeAliasPath))
            .from(SQLExpressions.union(targetColumnQuery, sourceColumnQuery).as("t1"));

    SQLQuery listQuery = queryFactory
            .select(Projections.constructor(DataLineageDto.class, dbNameAliasPath, tableNameAliasPath
                    , fieldNameAliasPath, fieldTypeAliasPath))
            .from(SQLExpressions.union(targetColumnQuery, sourceColumnQuery).as("t1"))
            .orderBy(fieldNameAliasPath.asc());

    if(pageable != null){
      //Pagination 적용
      listQuery.offset((long)pageable.getOffset());
      listQuery.limit((long)pageable.getPageSize());
    }

    Long total = countQuery.fetchCount();
    List<DataLineageDto> content = total > pageable.getOffset() ? listQuery.fetch() : Lists.newArrayList();
    return new PageImpl<>(content, pageable, total);
  }

  @Override
  public Page<DataLineageDto> getSQLList(String sqlQuery, Pageable pageable) {
    QDataLineage qDataLineage = new QDataLineage("data_lineage");

    StringPath sqlTypePath = Expressions.stringPath("sql_type");

    StringPath sqlQueryPath = Expressions.stringPath("sql_query");
    DateTimePath eventTimePath = Expressions.dateTimePath(DateTime.class, "event_time");
    StringPath sqlFilePath = Expressions.stringPath("sql_file");

    SQLQueryFactory queryFactory = new SQLQueryFactory(new Configuration(new MySQLTemplates()), dataSource);

    //Multiple Field를 Group by 할때 count 기능 지원이 안됨(JPQLQuery 사용불가)
    //https://github.com/querydsl/querydsl/issues/2134
    SQLQuery countQuery = queryFactory
            .select(sqlQueryPath, eventTimePath, sqlFilePath)
            .from(qDataLineage)
            .where(sqlTypePath.in(
                    DataLineage.SqlType.CREATETABLE_AS_SELECT.toString()
                    , DataLineage.SqlType.INSERT.toString()
                    , DataLineage.SqlType.PATH_WRITE.toString()
                    , DataLineage.SqlType.INSERT_OVERWRITE.toString())
//                    .and(sqlFilePath.isNotEmpty().and(sqlFilePath.isNotNull()))
            )
            .groupBy(sqlQueryPath, eventTimePath, sqlFilePath);


    JPQLQuery listQuery = from(qDataLineage)
            .select(Projections.constructor(DataLineageDto.class, qDataLineage.id.max(), qDataLineage.sqlQuery, qDataLineage.timestamp, qDataLineage.sqlFile))
            .where(qDataLineage.sqlType.in(DataLineage.SqlType.CREATETABLE_AS_SELECT.toString()
                    , DataLineage.SqlType.INSERT.toString()
                    , DataLineage.SqlType.PATH_WRITE.toString()
                    , DataLineage.SqlType.INSERT_OVERWRITE.toString())
//                    .and(qDataLineage.sqlFile.isNotEmpty().and(qDataLineage.sqlFile.isNotNull()))
            )
            .groupBy(qDataLineage.sqlQuery, qDataLineage.timestamp, qDataLineage.sqlFile)
            .orderBy(qDataLineage.timestamp.asc());

    if(StringUtils.isNotEmpty(sqlQuery)){
      countQuery.where(sqlQueryPath.containsIgnoreCase(sqlQuery));
      listQuery.where(qDataLineage.sqlQuery.containsIgnoreCase(sqlQuery));
    } else {
      countQuery.where(sqlQueryPath.isNotEmpty());
      listQuery.where(qDataLineage.sqlQuery.isNotEmpty());
    }

    if(pageable != null){
      //Pagination 적용
      listQuery.offset((long)pageable.getOffset());
      listQuery.limit((long)pageable.getPageSize());
    }

    Long total = countQuery.fetchCount();
    List<DataLineageDto> content = total > pageable.getOffset() ? listQuery.fetch() : Lists.newArrayList();
    return new PageImpl<>(content, pageable, total);
  }

  @Override
  public Page<DataLineageDto> getWorkflowList(String sqlFileName, Pageable pageable) {
    //검색 범위 는 sqlFileName

    QDataLineage qDataLineage = new QDataLineage("data_lineage");
    QDataLineageWorkFlow qDataLineageWorkFlow = new QDataLineageWorkFlow("data_lineage_workflow");

    NumberPath<Long> dataLineageIdPath = Expressions.numberPath(Long.class, qDataLineage, "id");
    StringPath sqlTypePath = Expressions.stringPath(qDataLineage, "sql_type");
    StringPath sqlQueryPath = Expressions.stringPath(qDataLineage, "sql_query");
    DateTimePath eventTimePath = Expressions.dateTimePath(DateTime.class, qDataLineage, "event_time");
    StringPath sqlFilePath = Expressions.stringPath(qDataLineage, "sql_file");

    NumberPath<Long> idPath = Expressions.numberPath(Long.class, qDataLineageWorkFlow, "id");
    StringPath workflowNamePath = Expressions.stringPath(qDataLineageWorkFlow, "name");
    StringPath taskContentPath = Expressions.stringPath(qDataLineageWorkFlow, "task_content");

    SQLQueryFactory queryFactory = new SQLQueryFactory(new Configuration(new MySQLTemplates()), dataSource);

    //Multiple Field를 Group by 할때 count 기능 지원이 안됨(JPQLQuery 사용불가)
    //https://github.com/querydsl/querydsl/issues/2134
    SQLQuery countSubQuery = queryFactory
            .select(sqlQueryPath, eventTimePath, sqlFilePath)
            .from(qDataLineage)
            .where(sqlTypePath.in(
                    DataLineage.SqlType.CREATETABLE_AS_SELECT.toString()
                    , DataLineage.SqlType.INSERT.toString()
                    , DataLineage.SqlType.PATH_WRITE.toString()
                    , DataLineage.SqlType.INSERT_OVERWRITE.toString())
                    .and(sqlFilePath.isNotEmpty().and(sqlFilePath.isNotNull()))
            )
            .groupBy(sqlQueryPath, eventTimePath, sqlFilePath);

    SQLQuery countQuery = queryFactory
            .select(sqlQueryPath, eventTimePath, sqlFilePath, idPath, workflowNamePath)
            .from(countSubQuery.as("data_lineage"))
            .join(qDataLineageWorkFlow).on(sqlFilePath.isNotEmpty().and(taskContentPath.contains(sqlFilePath)));

//    SQLQuery listQuery = queryFactory
//            .select(dataLineageIdPath.max(), sqlQueryPath, eventTimePath, sqlFilePath, idPath, workflowNamePath)
//            .from(qDataLineage)
//            .join(qDataLineageWorkFlow).on(sqlFilePath.isNotEmpty().and(taskContentPath.contains(sqlFilePath)))
//            .where(sqlTypePath.in(
//                    DataLineage.SqlType.CREATETABLE_AS_SELECT.toString()
//                    , DataLineage.SqlType.INSERT.toString()
//                    , DataLineage.SqlType.PATH_WRITE.toString()
//                    , DataLineage.SqlType.INSERT_OVERWRITE.toString())
////                    .and(sqlFilePath.isNotEmpty().and(sqlFilePath.isNotNull()))
//            )
//            .groupBy(sqlQueryPath, eventTimePath, sqlFilePath, idPath, workflowNamePath)
//            .orderBy(eventTimePath.asc());

    SQLQuery listSubQuery = queryFactory
            .select(dataLineageIdPath.max().as(dataLineageIdPath), sqlQueryPath, eventTimePath, sqlFilePath)
            .from(qDataLineage)
            .where(sqlTypePath.in(
                    DataLineage.SqlType.CREATETABLE_AS_SELECT.toString()
                    , DataLineage.SqlType.INSERT.toString()
                    , DataLineage.SqlType.PATH_WRITE.toString()
                    , DataLineage.SqlType.INSERT_OVERWRITE.toString())
                    .and(sqlFilePath.isNotEmpty().and(sqlFilePath.isNotNull()))
            )
            .groupBy(sqlQueryPath, eventTimePath, sqlFilePath);

    SQLQuery listQuery = queryFactory
            .select(dataLineageIdPath, sqlQueryPath, eventTimePath, sqlFilePath, idPath, workflowNamePath)
            .from(listSubQuery.as("data_lineage"))
            .join(qDataLineageWorkFlow).on(sqlFilePath.isNotEmpty().and(taskContentPath.contains(sqlFilePath)))
            .orderBy(eventTimePath.asc());

    if(StringUtils.isNotEmpty(sqlFileName)){
      countQuery.where(sqlFilePath.containsIgnoreCase(sqlFileName));
      listQuery.where(sqlFilePath.containsIgnoreCase(sqlFileName));
    }

    if(pageable != null){
      //Pagination 적용
      listQuery.offset((long)pageable.getOffset());
      listQuery.limit((long)pageable.getPageSize());
    }

    Long total = countQuery.fetchCount();
    List<DataLineageDto> content = Lists.newArrayList();
    if(total > pageable.getOffset()) {
      List<Tuple> tupleList = listQuery.fetch();
      if (tupleList != null) {
        content.addAll(
                tupleList.stream()
                        .map(tuple -> {
                          DataLineageDto dataLineageDto = new DataLineageDto(
                                  tuple.get(0, Long.class),
                                  tuple.get(1, String.class),
                                  tuple.get(2, DateTime.class),
                                  tuple.get(3, String.class),
                                  tuple.get(4, Long.class),
                                  tuple.get(5, String.class)
                          );
                          return dataLineageDto;
                        })
                        .collect(Collectors.toList())
        );
      }
    }
    return new PageImpl<>(content, pageable, total);
  }

  @Override
  public List<DataLineage> getDataLineageWithWorkflow(String sqlId){
    String nativeSqlString = "select datalineag0_.id AS id1_19_0_,\n" +
            "   datalineag1_.id AS id1_21_1_,\n" +
            "   datalineag0_.cluster AS cluster2_19_0_,\n" +
            "   datalineag0_.current_db AS current_3_19_0_,\n" +
            "   datalineag0_.job_id AS job_id4_19_0_,\n" +
            "   datalineag0_.ms AS ms5_19_0_,\n" +
            "   datalineag0_.owner AS owner6_19_0_,\n" +
            "   datalineag0_.predicate AS predicat7_19_0_,\n" +
            "   datalineag0_.predicate_str AS predicat8_19_0_,\n" +
            "   datalineag0_.pruning AS pruning9_19_0_,\n" +
            "   datalineag0_.source_db_name AS source_10_19_0_,\n" +
            "   datalineag0_.source_field_comment AS source_11_19_0_,\n" +
            "   datalineag0_.source_field_name AS source_12_19_0_,\n" +
            "   datalineag0_.source_field_type AS source_13_19_0_,\n" +
            "   datalineag0_.source_tb_name AS source_14_19_0_,\n" +
            "   datalineag0_.sql_expr AS sql_exp15_19_0_,\n" +
            "   datalineag0_.sql_file AS sql_fil16_19_0_,\n" +
            "   datalineag0_.sql_hash AS sql_has17_19_0_,\n" +
            "   datalineag0_.sql_id AS sql_id18_19_0_,\n" +
            "   datalineag0_.sql_query AS sql_que19_19_0_,\n" +
            "   datalineag0_.sql_type AS sql_typ20_19_0_,\n" +
            "   datalineag0_.target_db_name AS target_21_19_0_,\n" +
            "   datalineag0_.target_field_comment AS target_22_19_0_,\n" +
            "   datalineag0_.target_field_name AS target_23_19_0_,\n" +
            "   datalineag0_.target_field_type AS target_24_19_0_,\n" +
            "   datalineag0_.target_tb_name AS target_25_19_0_,\n" +
            "   datalineag0_.target_table_temporary AS target_26_19_0_,\n" +
            "   datalineag0_.target_table_type AS target_27_19_0_,\n" +
            "   datalineag0_.event_time AS event_t28_19_0_,\n" +
            "   datalineag0_.user_ip_addr AS user_ip29_19_0_,\n" +
            "   datalineag1_.name AS name2_21_1_,\n" +
            "   datalineag1_.shape_id AS shape_id3_21_1_,\n" +
            "   datalineag1_.task_content AS task_con4_21_1_,\n" +
            "   datalineag1_.task_description AS task_des5_21_1_,\n" +
            "   datalineag1_.task_file AS task_fil6_21_1_,\n" +
            "   datalineag1_.task_hadoop AS task_had7_21_1_,\n" +
            "   datalineag1_.task_id AS task_id8_21_1_,\n" +
            "   datalineag1_.task_name AS task_nam9_21_1_,\n" +
            "   datalineag1_.task_type AS task_ty10_21_1_,\n" +
            "   datalineag1_.workflow_id AS workflo11_21_1_ \n" +
            "from data_lineage datalineag0_\n" +
            "  left join data_lineage_workflow datalineag1_\n" +
            "    on (datalineag0_.sql_file <> '' and datalineag1_.task_content like concat(concat('%', datalineag0_.sql_file), '%') escape '!')\n" +
            "where (datalineag0_.sql_type in ('" +
                  DataLineage.SqlType.CREATETABLE_AS_SELECT.toString() + "' , '" +
                  DataLineage.SqlType.INSERT.toString() + "' , '" +
                  DataLineage.SqlType.PATH_WRITE.toString() + "' , '" +
                  DataLineage.SqlType.INSERT_OVERWRITE.toString() + "'))\n" +
            "      and datalineag0_.sql_id=:sqlId\n";

    Query nativeQuery = getEntityManager().createNativeQuery(nativeSqlString).setParameter("sqlId", sqlId);

    List<DataLineage> dataLineageList = Lists.newArrayList();

    List<Object[]> tupleList = nativeQuery.getResultList();
    if(tupleList != null){
      dataLineageList.addAll(
              tupleList.stream()
                      .map(tuple -> objectToDataLineage(tuple))
                      .collect(Collectors.toList())
      );
    }
    return dataLineageList;
  }

  @Override
  public List<DataLineage> getDataLineageWithWorkflowForward(String dbName, String tbName){

    String nativeSqlString = "select datalineag0_.id AS id1_19_0_,\n" +
            "   datalineag1_.id AS id1_21_1_,\n" +
            "   datalineag0_.cluster AS cluster2_19_0_,\n" +
            "   datalineag0_.current_db AS current_3_19_0_,\n" +
            "   datalineag0_.job_id AS job_id4_19_0_,\n" +
            "   datalineag0_.ms AS ms5_19_0_,\n" +
            "   datalineag0_.owner AS owner6_19_0_,\n" +
            "   datalineag0_.predicate AS predicat7_19_0_,\n" +
            "   datalineag0_.predicate_str AS predicat8_19_0_,\n" +
            "   datalineag0_.pruning AS pruning9_19_0_,\n" +
            "   datalineag0_.source_db_name AS source_10_19_0_,\n" +
            "   datalineag0_.source_field_comment AS source_11_19_0_,\n" +
            "   datalineag0_.source_field_name AS source_12_19_0_,\n" +
            "   datalineag0_.source_field_type AS source_13_19_0_,\n" +
            "   datalineag0_.source_tb_name AS source_14_19_0_,\n" +
            "   datalineag0_.sql_expr AS sql_exp15_19_0_,\n" +
            "   datalineag0_.sql_file AS sql_fil16_19_0_,\n" +
            "   datalineag0_.sql_hash AS sql_has17_19_0_,\n" +
            "   datalineag0_.sql_id AS sql_id18_19_0_,\n" +
            "   datalineag0_.sql_query AS sql_que19_19_0_,\n" +
            "   datalineag0_.sql_type AS sql_typ20_19_0_,\n" +
            "   datalineag0_.target_db_name AS target_21_19_0_,\n" +
            "   datalineag0_.target_field_comment AS target_22_19_0_,\n" +
            "   datalineag0_.target_field_name AS target_23_19_0_,\n" +
            "   datalineag0_.target_field_type AS target_24_19_0_,\n" +
            "   datalineag0_.target_tb_name AS target_25_19_0_,\n" +
            "   datalineag0_.target_table_temporary AS target_26_19_0_,\n" +
            "   datalineag0_.target_table_type AS target_27_19_0_,\n" +
            "   datalineag0_.event_time AS event_t28_19_0_,\n" +
            "   datalineag0_.user_ip_addr AS user_ip29_19_0_,\n" +
            "   datalineag1_.name AS name2_21_1_,\n" +
            "   datalineag1_.shape_id AS shape_id3_21_1_,\n" +
            "   datalineag1_.task_content AS task_con4_21_1_,\n" +
            "   datalineag1_.task_description AS task_des5_21_1_,\n" +
            "   datalineag1_.task_file AS task_fil6_21_1_,\n" +
            "   datalineag1_.task_hadoop AS task_had7_21_1_,\n" +
            "   datalineag1_.task_id AS task_id8_21_1_,\n" +
            "   datalineag1_.task_name AS task_nam9_21_1_,\n" +
            "   datalineag1_.task_type AS task_ty10_21_1_,\n" +
            "   datalineag1_.workflow_id AS workflo11_21_1_ \n" +
            "from data_lineage datalineag0_\n" +
            "  left join data_lineage_workflow datalineag1_\n" +
            "    on (datalineag0_.sql_file <> '' and datalineag1_.task_content like concat(concat('%', datalineag0_.sql_file), '%') escape '!')\n" +
            "where (datalineag0_.sql_type in ('" +
                  DataLineage.SqlType.CREATETABLE_AS_SELECT.toString() + "' , '" +
                  DataLineage.SqlType.INSERT.toString() + "' , '" +
                  DataLineage.SqlType.PATH_WRITE.toString() + "' , '" +
                  DataLineage.SqlType.INSERT_OVERWRITE.toString() + "'))\n" +
            "      and datalineag0_.source_db_name=:dbName\n" +
            "      and datalineag0_.source_tb_name=:tbName\n";

    Query nativeQuery = getEntityManager().createNativeQuery(nativeSqlString).setParameter("dbName", dbName).setParameter("tbName", tbName);

    List<DataLineage> dataLineageList = Lists.newArrayList();

    List<Object[]> tupleList = nativeQuery.getResultList();
    if(tupleList != null){
      dataLineageList.addAll(
              tupleList.stream()
                      .map(tuple -> objectToDataLineage(tuple))
                      .collect(Collectors.toList())
      );
    }
    return dataLineageList;
  }

  @Override
  public List<DataLineage> getDataLineageWithWorkflowBackward(String dbName, String tbName){

    String nativeSqlString = "select datalineag0_.id AS id1_19_0_,\n" +
            "   datalineag1_.id AS id1_21_1_,\n" +
            "   datalineag0_.cluster AS cluster2_19_0_,\n" +
            "   datalineag0_.current_db AS current_3_19_0_,\n" +
            "   datalineag0_.job_id AS job_id4_19_0_,\n" +
            "   datalineag0_.ms AS ms5_19_0_,\n" +
            "   datalineag0_.owner AS owner6_19_0_,\n" +
            "   datalineag0_.predicate AS predicat7_19_0_,\n" +
            "   datalineag0_.predicate_str AS predicat8_19_0_,\n" +
            "   datalineag0_.pruning AS pruning9_19_0_,\n" +
            "   datalineag0_.source_db_name AS source_10_19_0_,\n" +
            "   datalineag0_.source_field_comment AS source_11_19_0_,\n" +
            "   datalineag0_.source_field_name AS source_12_19_0_,\n" +
            "   datalineag0_.source_field_type AS source_13_19_0_,\n" +
            "   datalineag0_.source_tb_name AS source_14_19_0_,\n" +
            "   datalineag0_.sql_expr AS sql_exp15_19_0_,\n" +
            "   datalineag0_.sql_file AS sql_fil16_19_0_,\n" +
            "   datalineag0_.sql_hash AS sql_has17_19_0_,\n" +
            "   datalineag0_.sql_id AS sql_id18_19_0_,\n" +
            "   datalineag0_.sql_query AS sql_que19_19_0_,\n" +
            "   datalineag0_.sql_type AS sql_typ20_19_0_,\n" +
            "   datalineag0_.target_db_name AS target_21_19_0_,\n" +
            "   datalineag0_.target_field_comment AS target_22_19_0_,\n" +
            "   datalineag0_.target_field_name AS target_23_19_0_,\n" +
            "   datalineag0_.target_field_type AS target_24_19_0_,\n" +
            "   datalineag0_.target_tb_name AS target_25_19_0_,\n" +
            "   datalineag0_.target_table_temporary AS target_26_19_0_,\n" +
            "   datalineag0_.target_table_type AS target_27_19_0_,\n" +
            "   datalineag0_.event_time AS event_t28_19_0_,\n" +
            "   datalineag0_.user_ip_addr AS user_ip29_19_0_,\n" +
            "   datalineag1_.name AS name2_21_1_,\n" +
            "   datalineag1_.shape_id AS shape_id3_21_1_,\n" +
            "   datalineag1_.task_content AS task_con4_21_1_,\n" +
            "   datalineag1_.task_description AS task_des5_21_1_,\n" +
            "   datalineag1_.task_file AS task_fil6_21_1_,\n" +
            "   datalineag1_.task_hadoop AS task_had7_21_1_,\n" +
            "   datalineag1_.task_id AS task_id8_21_1_,\n" +
            "   datalineag1_.task_name AS task_nam9_21_1_,\n" +
            "   datalineag1_.task_type AS task_ty10_21_1_,\n" +
            "   datalineag1_.workflow_id AS workflo11_21_1_ \n" +
            "from data_lineage datalineag0_\n" +
            "  left join data_lineage_workflow datalineag1_\n" +
            "    on (datalineag0_.sql_file <> '' and datalineag1_.task_content like concat(concat('%', datalineag0_.sql_file), '%') escape '!')\n" +
            "where (datalineag0_.sql_type in ('" +
                  DataLineage.SqlType.CREATETABLE_AS_SELECT.toString() + "' , '" +
                  DataLineage.SqlType.INSERT.toString() + "' , '" +
                  DataLineage.SqlType.PATH_WRITE.toString() + "' , '" +
                  DataLineage.SqlType.INSERT_OVERWRITE.toString() + "'))\n" +
            "      and datalineag0_.target_db_name=:dbName\n" +
            "      and datalineag0_.target_tb_name=:tbName\n";

    Query nativeQuery = getEntityManager().createNativeQuery(nativeSqlString).setParameter("dbName", dbName).setParameter("tbName", tbName);

    List<DataLineage> dataLineageList = Lists.newArrayList();

    List<Object[]> tupleList = nativeQuery.getResultList();

    if(tupleList != null){
      dataLineageList.addAll(
              tupleList.stream()
                      .map(tuple -> objectToDataLineage(tuple))
                      .collect(Collectors.toList())
      );
    }
    return dataLineageList;
  }

  private DataLineage objectToDataLineage(Object[] obj){
    DataLineage dataLineage = new DataLineage();
    dataLineage.setId(obj[0] == null ? null : ((BigInteger) obj[0]).longValue());
    dataLineage.setWorkFlowId(obj[1] == null ? null : ((BigInteger) obj[1]).longValue());
    dataLineage.setCluster((String) obj[2]);
    dataLineage.setCurrentDatabase((String) obj[3]);
    dataLineage.setJobId((String) obj[4]);
    dataLineage.setMs((DateTime) obj[5]);
    dataLineage.setOwner((String) obj[6]);
    dataLineage.setPredicate((Boolean) obj[7]);
    dataLineage.setPredicateStr((String) obj[8]);
    dataLineage.setPruning((Boolean) obj[9]);
    dataLineage.setSourceDataBaseName((String) obj[10]);
    dataLineage.setSourceFieldComment((String) obj[11]);
    dataLineage.setSourceFieldName((String) obj[12]);
    dataLineage.setSourceFieldType((String) obj[13]);
    dataLineage.setSourceTableName((String) obj[14]);
    dataLineage.setSqlExpr((String) obj[15]);
    dataLineage.setSqlFile((String) obj[16]);
    dataLineage.setSqlHash((String) obj[17]);
    dataLineage.setSqlId((String) obj[18]);
    dataLineage.setSqlQuery(obj[19].toString());
    dataLineage.setSqlType((String) obj[20]);
    dataLineage.setTargetDataBaseName((String) obj[21]);
    dataLineage.setTargetFieldComment((String) obj[22]);
    dataLineage.setTargetFieldName((String) obj[23]);
    dataLineage.setTargetFieldType((String) obj[24]);
    dataLineage.setTargetTableName((String) obj[25]);
    dataLineage.setTargetTableTemporary((Boolean) obj[26]);
    dataLineage.setTargetTableType((String) obj[27]);
    dataLineage.setTimestamp(obj[28] == null ? null : new DateTime(obj[28]));
    dataLineage.setUserIpAddress((String) obj[29]);
    dataLineage.setWorkFlowName((String) obj[30]);
    return dataLineage;
  }
}

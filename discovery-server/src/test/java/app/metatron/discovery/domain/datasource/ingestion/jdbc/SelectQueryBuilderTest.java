package app.metatron.discovery.domain.datasource.ingestion.jdbc;

import org.joda.time.DateTime;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.dialect.DruidDialect;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.dataconnection.dialect.MySQLDialect;
import app.metatron.discovery.domain.dataconnection.dialect.PostgresqlDialect;
import app.metatron.discovery.domain.dataconnection.dialect.PrestoDialect;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;

/**
 *
 */
public class SelectQueryBuilderTest
//    extends AbstractIntegrationTest
{

  static {
    System.setProperty("pf4j.pluginsDir", "../discovery-distribution/extensions");
  }

  @Test
  public void incrementalQueryTest(){
    String sql = "select * -- asdas;\n" +
        "-- aasfs;d;a;s\n" +
        "from book ;; ; ; -- asda; \n" +
        "-- asda;s;d; \n" +
        "# asda;s;d \n" +
        "-- asda;s;d;";

    //create incremental query
    BatchIngestionInfo batchIngestionInfo = new BatchIngestionInfo();
    batchIngestionInfo.setQuery(sql);
    batchIngestionInfo.setMaxLimit(1000);

    List<Field> fields = new ArrayList<>();
    fields.add(new Field("type", DataType.STRING, 0));
    fields.add(new Field("created_by", DataType.STRING, 1));
    fields.add(new Field("created_time", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 2));

    DataConnection realConnection = new DataConnection("MYSQL");

    String incrementalQuery = new SelectQueryBuilder(realConnection, new MySQLDialect())
        .projection(fields)
        .query(batchIngestionInfo, realConnection)
        .incremental(fields.get(2), DateTime.now().toString(JdbcDialect.CURRENT_DATE_FORMAT))
        .limit(0, batchIngestionInfo.getMaxLimit())
        .build();

    System.out.println(incrementalQuery);

  }

  @Test
  public void timestampFieldPresto(){
    String implementor = "PRESTO";

    String limitDateStr = "2018-07-01 00:00:00";
    String sql = "select \n" +
        "  eventtime as msUnix, \n" +
        "  eventtime / 1000 as secUnix, \n" +
        "  from_unixtime(floor(eventtime/1000)) as timestampTimestamp, \n" +
        "  format_datetime(from_unixtime(floor(eventtime/1000)), 'yyyy-MM-dd HH:mm:ss.SSS') as strTimestamp\n" +
        "from default.lineage";
    //create incremental query
    BatchIngestionInfo batchIngestionInfo = new BatchIngestionInfo();
    batchIngestionInfo.setQuery(sql);
    batchIngestionInfo.setMaxLimit(1000);

    List<Field> fields = new ArrayList<>();

    Field msUnixTime = new Field("msUnix", DataType.INTEGER, Field.FieldRole.TIMESTAMP, 0);
    msUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    msUnixTime.setFormat("{  \n" +
                                 "            \"type\":\"time_unix\",\n" +
                                 "            \"timeZone\":\"UTC\",\n" +
                                 "            \"locale\":\"en\",\n" +
                                 "            \"unit\":\"MILLISECOND\",\n" +
                                 "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                                 "         }");
    fields.add(msUnixTime);

    Field secondUnixTime = new Field("secUnix", DataType.LONG, Field.FieldRole.TIMESTAMP, 1);
    secondUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    secondUnixTime.setFormat("{  \n" +
                                 "            \"type\":\"time_unix\",\n" +
                                 "            \"timeZone\":\"UTC\",\n" +
                                 "            \"locale\":\"en\",\n" +
                                 "            \"unit\":\"SECOND\",\n" +
                                 "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                                 "         }");
    fields.add(secondUnixTime);

    Field timestampTimestamp = new Field("timestampTimestamp", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 2);
    timestampTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    timestampTimestamp.setFormat("{  \n" +
                                     "            \"type\":\"time_format\",\n" +
                                     "            \"format\":\"yyyy-MM-dd HH:mm:ss.S\",\n" +
                                     "            \"timeZone\":\"Asia/Seoul\",\n" +
                                     "            \"locale\":\"en\"\n" +
                                     "         }");
    fields.add(timestampTimestamp);

    Field strTimestamp = new Field("strTimestamp", DataType.STRING, Field.FieldRole.TIMESTAMP, 3);
    strTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    strTimestamp.setFormat("{  \n" +
                               "            \"type\":\"time_format\",\n" +
                               "            \"format\":\"yyyy-MM-dd HH:mm:ss.SSS\",\n" +
                               "            \"timeZone\":\"Asia/Seoul\",\n" +
                               "            \"locale\":\"en\"\n" +
                               "         }");
    fields.add(strTimestamp);

    printIncrementalQuery(implementor, fields, batchIngestionInfo, limitDateStr);
  }

  @Test
  public void timestampFieldHive(){
    String implementor = "HIVE";

    String limitDateStr = "2018-07-01 00:00:00";
    String sql = "select \n" +
        "  eventtime as msUnix, \n" +
        "  floor(eventtime / 1000) as secUnix, \n" +
        "  from_unixtime(floor(eventtime/1000)) as timestampTimestamp, \n" +
        "    date_Format(from_unixtime(floor(eventtime/1000)), 'yyyy-MM-dd HH:mm:ss.SSS') as strTimestamp\n" +
        "from default.lineage";
    //create incremental query
    BatchIngestionInfo batchIngestionInfo = new BatchIngestionInfo();
    batchIngestionInfo.setQuery(sql);
    batchIngestionInfo.setMaxLimit(1000);

    List<Field> fields = new ArrayList<>();

    Field msUnixTime = new Field("msUnix", DataType.INTEGER, Field.FieldRole.TIMESTAMP, 0);
    msUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    msUnixTime.setFormat("{  \n" +
                             "            \"type\":\"time_unix\",\n" +
                             "            \"timeZone\":\"UTC\",\n" +
                             "            \"locale\":\"en\",\n" +
                             "            \"unit\":\"MILLISECOND\",\n" +
                             "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                             "         }");
    fields.add(msUnixTime);

    Field secondUnixTime = new Field("secUnix", DataType.LONG, Field.FieldRole.TIMESTAMP, 1);
    secondUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    secondUnixTime.setFormat("{  \n" +
                                 "            \"type\":\"time_unix\",\n" +
                                 "            \"timeZone\":\"UTC\",\n" +
                                 "            \"locale\":\"en\",\n" +
                                 "            \"unit\":\"SECOND\",\n" +
                                 "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                                 "         }");
    fields.add(secondUnixTime);

    Field timestampTimestamp = new Field("timestampTimestamp", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 2);
    timestampTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    timestampTimestamp.setFormat("{  \n" +
                                     "            \"type\":\"time_format\",\n" +
                                     "            \"format\":\"yyyy-MM-dd HH:mm:ss.S\",\n" +
                                     "            \"timeZone\":\"Asia/Seoul\",\n" +
                                     "            \"locale\":\"en\"\n" +
                                     "         }");
    fields.add(timestampTimestamp);

    Field strTimestamp = new Field("strTimestamp", DataType.STRING, Field.FieldRole.TIMESTAMP, 3);
    strTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    strTimestamp.setFormat("{  \n" +
                               "            \"type\":\"time_format\",\n" +
                               "            \"format\":\"yyyy-MM-dd HH:mm:ss.SSS\",\n" +
                               "            \"timeZone\":\"Asia/Seoul\",\n" +
                               "            \"locale\":\"en\"\n" +
                               "         }");
    fields.add(strTimestamp);

    printIncrementalQuery(implementor, fields, batchIngestionInfo, limitDateStr);
  }

  @Test
  public void timestampFieldMySQL(){
    String implementor = "MYSQL";

    String limitDateStr = "2019-04-01 00:00:00";
    String sql = "select \n" +
        "UNIX_TIMESTAMP(created_time) * 1000 as msUnix, \n" +
        "UNIX_TIMESTAMP(created_time) as secUnix,\n" +
        "created_time as timestampTimestamp,\n" +
        "DATE_FORMAT(created_time, '%Y-%m-%d %T') as strTimestamp\n" +
        "from polaris.book";
    //create incremental query
    BatchIngestionInfo batchIngestionInfo = new BatchIngestionInfo();
    batchIngestionInfo.setQuery(sql);
    batchIngestionInfo.setMaxLimit(1000);

    List<Field> fields = new ArrayList<>();

    Field msUnixTime = new Field("msUnix", DataType.INTEGER, Field.FieldRole.TIMESTAMP, 0);
    msUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    msUnixTime.setFormat("{  \n" +
                             "            \"type\":\"time_unix\",\n" +
                             "            \"timeZone\":\"UTC\",\n" +
                             "            \"locale\":\"en\",\n" +
                             "            \"unit\":\"MILLISECOND\",\n" +
                             "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                             "         }");
    fields.add(msUnixTime);

    Field secondUnixTime = new Field("secUnix", DataType.LONG, Field.FieldRole.TIMESTAMP, 1);
    secondUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    secondUnixTime.setFormat("{  \n" +
                                 "            \"type\":\"time_unix\",\n" +
                                 "            \"timeZone\":\"UTC\",\n" +
                                 "            \"locale\":\"en\",\n" +
                                 "            \"unit\":\"SECOND\",\n" +
                                 "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                                 "         }");
    fields.add(secondUnixTime);

    Field timestampTimestamp = new Field("timestampTimestamp", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 2);
    timestampTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    timestampTimestamp.setFormat("{  \n" +
                                     "            \"type\":\"time_format\",\n" +
                                     "            \"format\":\"yyyy-MM-dd HH:mm:ss.S\",\n" +
                                     "            \"timeZone\":\"Asia/Seoul\",\n" +
                                     "            \"locale\":\"en\"\n" +
                                     "         }");
    fields.add(timestampTimestamp);

    Field strTimestamp = new Field("strTimestamp", DataType.STRING, Field.FieldRole.TIMESTAMP, 3);
    strTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    strTimestamp.setFormat("{  \n" +
                               "            \"type\":\"time_format\",\n" +
                               "            \"format\":\"yyyy-MM-dd HH:mm:ss.SSS\",\n" +
                               "            \"timeZone\":\"Asia/Seoul\",\n" +
                               "            \"locale\":\"en\"\n" +
                               "         }");
    fields.add(strTimestamp);

    printIncrementalQuery(implementor, fields, batchIngestionInfo, limitDateStr);
  }

  @Test
  public void timestampFieldPostgresql(){
    String implementor = "POSTGRESQL";

    String limitDateStr = "2007-05-13 00:00:00";
    String sql = "SELECT \n" +
        "extract(epoch from payment_date) * 1000 as msUnix\n" +
        ", extract(epoch from payment_date) as secUnix\n" +
        ", payment_date as timestampTimestamp\n" +
        ", to_char(payment_date, 'YYYY-MM-DD HH24:MI:SS') as strTimestamp\n" +
        "FROM public.payment";
    //create incremental query
    BatchIngestionInfo batchIngestionInfo = new BatchIngestionInfo();
    batchIngestionInfo.setQuery(sql);
    batchIngestionInfo.setMaxLimit(10000);

    List<Field> fields = new ArrayList<>();

    Field msUnixTime = new Field("msUnix", DataType.INTEGER, Field.FieldRole.TIMESTAMP, 0);
    msUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    msUnixTime.setFormat("{  \n" +
                             "            \"type\":\"time_unix\",\n" +
                             "            \"timeZone\":\"UTC\",\n" +
                             "            \"locale\":\"en\",\n" +
                             "            \"unit\":\"MILLISECOND\",\n" +
                             "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                             "         }");
    fields.add(msUnixTime);

    Field secondUnixTime = new Field("secUnix", DataType.LONG, Field.FieldRole.TIMESTAMP, 1);
    secondUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    secondUnixTime.setFormat("{  \n" +
                                 "            \"type\":\"time_unix\",\n" +
                                 "            \"timeZone\":\"UTC\",\n" +
                                 "            \"locale\":\"en\",\n" +
                                 "            \"unit\":\"SECOND\",\n" +
                                 "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                                 "         }");
    fields.add(secondUnixTime);

    Field timestampTimestamp = new Field("timestampTimestamp", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 2);
    timestampTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    timestampTimestamp.setFormat("{  \n" +
                                     "            \"type\":\"time_format\",\n" +
                                     "            \"format\":\"yyyy-MM-dd HH:mm:ss.S\",\n" +
                                     "            \"timeZone\":\"Asia/Seoul\",\n" +
                                     "            \"locale\":\"en\"\n" +
                                     "         }");
    fields.add(timestampTimestamp);

    Field strTimestamp = new Field("strTimestamp", DataType.STRING, Field.FieldRole.TIMESTAMP, 3);
    strTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    strTimestamp.setFormat("{  \n" +
                               "            \"type\":\"time_format\",\n" +
                               "            \"format\":\"yyyy-MM-dd HH:mm:ss.SSS\",\n" +
                               "            \"timeZone\":\"Asia/Seoul\",\n" +
                               "            \"locale\":\"en\"\n" +
                               "         }");
    fields.add(strTimestamp);

    printIncrementalQuery(implementor, fields, batchIngestionInfo, limitDateStr);
  }

  @Test
  public void timestampFieldDruid(){
    String implementor = "DRUID";

    String limitDateStr = "2014-11-02 00:00:00";
    String sql = "SELECT \n" +
        "TIMESTAMP_TO_MILLIS(TIME_PARSE(\"ShipDate\", 'yyyy. MM. dd.')) as msUnix\n" +
        ", TIMESTAMP_TO_MILLIS(TIME_PARSE(\"ShipDate\", 'yyyy. MM. dd.')) / 1000 as secUnix\n" +
        ", TIME_PARSE(\"ShipDate\", 'yyyy. MM. dd.') as timestampTimestamp\n" +
        ", TIME_FORMAT(TIME_PARSE(\"ShipDate\", 'yyyy. MM. dd.'), 'yyyy-MM-dd HH:mm:ss') as strTimestamp\n" +
        "FROM druid.\"sales_geo\"";
    //create incremental query
    BatchIngestionInfo batchIngestionInfo = new BatchIngestionInfo();
    batchIngestionInfo.setQuery(sql);
    batchIngestionInfo.setMaxLimit(1000);

    List<Field> fields = new ArrayList<>();

    Field msUnixTime = new Field("msUnix", DataType.INTEGER, Field.FieldRole.TIMESTAMP, 0);
    msUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    msUnixTime.setFormat("{  \n" +
                             "            \"type\":\"time_unix\",\n" +
                             "            \"timeZone\":\"UTC\",\n" +
                             "            \"locale\":\"en\",\n" +
                             "            \"unit\":\"MILLISECOND\",\n" +
                             "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                             "         }");
    fields.add(msUnixTime);

    Field secondUnixTime = new Field("secUnix", DataType.LONG, Field.FieldRole.TIMESTAMP, 1);
    secondUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    secondUnixTime.setFormat("{  \n" +
                                 "            \"type\":\"time_unix\",\n" +
                                 "            \"timeZone\":\"UTC\",\n" +
                                 "            \"locale\":\"en\",\n" +
                                 "            \"unit\":\"SECOND\",\n" +
                                 "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                                 "         }");
    fields.add(secondUnixTime);

    Field timestampTimestamp = new Field("timestampTimestamp", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 2);
    timestampTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    timestampTimestamp.setFormat("{  \n" +
                                     "            \"type\":\"time_format\",\n" +
                                     "            \"format\":\"yyyy-MM-dd HH:mm:ss.S\",\n" +
                                     "            \"timeZone\":\"Asia/Seoul\",\n" +
                                     "            \"locale\":\"en\"\n" +
                                     "         }");
    fields.add(timestampTimestamp);

    Field strTimestamp = new Field("strTimestamp", DataType.STRING, Field.FieldRole.TIMESTAMP, 3);
    strTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    strTimestamp.setFormat("{  \n" +
                               "            \"type\":\"time_format\",\n" +
                               "            \"format\":\"yyyy-MM-dd HH:mm:ss\",\n" +
                               "            \"timeZone\":\"Asia/Seoul\",\n" +
                               "            \"locale\":\"en\"\n" +
                               "         }");
    fields.add(strTimestamp);

    printIncrementalQuery(implementor, fields, batchIngestionInfo, limitDateStr);
  }

  @Test
  public void timestampFieldMSSQL(){
    String implementor = "MSSQL";

    String limitDateStr = "2017-04-21 00:00:00";
    String sql = "SELECT \n" +
        "(CAST(DATEDIFF(s, '1970-01-01 00:00:00', time) as BIGINT) * 1000) as msUnix\n" +
        ", DATEDIFF(s, '1970-01-01 00:00:00', time) as secUnix\n" +
        ", convert(datetime, time) as timestampTimestamp\n" +
        ", CONVERT(NVARCHAR(max), time + ' 00:00:00', 126) as strTimestamp\n" +
        "FROM dbo.sample_ingestion";
    //create incremental query
    BatchIngestionInfo batchIngestionInfo = new BatchIngestionInfo();
    batchIngestionInfo.setQuery(sql);
    batchIngestionInfo.setMaxLimit(1000);

    List<Field> fields = new ArrayList<>();

    Field msUnixTime = new Field("msUnix", DataType.INTEGER, Field.FieldRole.TIMESTAMP, 0);
    msUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    msUnixTime.setFormat("{  \n" +
                             "            \"type\":\"time_unix\",\n" +
                             "            \"timeZone\":\"UTC\",\n" +
                             "            \"locale\":\"en\",\n" +
                             "            \"unit\":\"MILLISECOND\",\n" +
                             "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                             "         }");
    fields.add(msUnixTime);

    Field secondUnixTime = new Field("secUnix", DataType.LONG, Field.FieldRole.TIMESTAMP, 1);
    secondUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    secondUnixTime.setFormat("{  \n" +
                                 "            \"type\":\"time_unix\",\n" +
                                 "            \"timeZone\":\"UTC\",\n" +
                                 "            \"locale\":\"en\",\n" +
                                 "            \"unit\":\"SECOND\",\n" +
                                 "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                                 "         }");
    fields.add(secondUnixTime);

    Field timestampTimestamp = new Field("timestampTimestamp", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 2);
    timestampTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    timestampTimestamp.setFormat("{  \n" +
                                     "            \"type\":\"time_format\",\n" +
                                     "            \"format\":\"yyyy-MM-dd HH:mm:ss.S\",\n" +
                                     "            \"timeZone\":\"Asia/Seoul\",\n" +
                                     "            \"locale\":\"en\"\n" +
                                     "         }");
    fields.add(timestampTimestamp);

    Field strTimestamp = new Field("strTimestamp", DataType.STRING, Field.FieldRole.TIMESTAMP, 3);
    strTimestamp.setLogicalType(LogicalType.TIMESTAMP);
    strTimestamp.setFormat("{  \n" +
                               "            \"type\":\"time_format\",\n" +
                               "            \"format\":\"yyyy-MM-dd HH:mm:ss.SSS\",\n" +
                               "            \"timeZone\":\"Asia/Seoul\",\n" +
                               "            \"locale\":\"en\"\n" +
                               "         }");
    fields.add(strTimestamp);

    printIncrementalQuery(implementor, fields, batchIngestionInfo, limitDateStr);
  }



  public DataConnection getDataConnection(String implementor){
    return new DataConnection(implementor);
  }

  public JdbcDialect getDialect(String implementor){
    switch (implementor){
      case "PRESTO" : return new PrestoDialect();
      case "HIVE" : return new HiveDialect();
      case "MYSQL" : return new MySQLDialect();
      case "POSTGRESQL" : return new PostgresqlDialect();
      case "DRUID" : return new DruidDialect();
      case "MSSQL" : case "TIBERO" : case "ORACLE" : default :
        return DataConnectionHelper.lookupDialect(implementor);
    }
  }

  @Test
  public void timestampFieldHive2(){
    String implementor = "HIVE";

    String limitDateStr = "2018-07-01 00:00:00";
    String sql = "Select * from default.lineage;";

    //create incremental query
    BatchIngestionInfo batchIngestionInfo = new BatchIngestionInfo();
    batchIngestionInfo.setDataType(JdbcIngestionInfo.DataType.QUERY);
    batchIngestionInfo.setQuery(sql);
    batchIngestionInfo.setMaxLimit(1000);

    List<Field> fields = new ArrayList<>();

    Field msUnixTime = new Field("lineage.eventtime", DataType.INTEGER, Field.FieldRole.TIMESTAMP, 0);
    msUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    msUnixTime.setFormat("{  \n" +
                             "            \"type\":\"time_unix\",\n" +
                             "            \"timeZone\":\"UTC\",\n" +
                             "            \"locale\":\"en\",\n" +
                             "            \"unit\":\"MILLISECOND\",\n" +
                             "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                             "         }");
    fields.add(msUnixTime);
//
//    Field secondUnixTime = new Field("secUnix", DataType.LONG, Field.FieldRole.TIMESTAMP, 1);
//    secondUnixTime.setLogicalType(LogicalType.TIMESTAMP);
//    secondUnixTime.setFormat("{  \n" +
//                                 "            \"type\":\"time_unix\",\n" +
//                                 "            \"timeZone\":\"UTC\",\n" +
//                                 "            \"locale\":\"en\",\n" +
//                                 "            \"unit\":\"SECOND\",\n" +
//                                 "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
//                                 "         }");
//    fields.add(secondUnixTime);
//
//    Field timestampTimestamp = new Field("timestampTimestamp", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 2);
//    timestampTimestamp.setLogicalType(LogicalType.TIMESTAMP);
//    timestampTimestamp.setFormat("{  \n" +
//                                     "            \"type\":\"time_format\",\n" +
//                                     "            \"format\":\"yyyy-MM-dd HH:mm:ss.S\",\n" +
//                                     "            \"timeZone\":\"Asia/Seoul\",\n" +
//                                     "            \"locale\":\"en\"\n" +
//                                     "         }");
//    fields.add(timestampTimestamp);

//    Field strTimestamp = new Field("sch_index_query_top_daily.rankday", DataType.STRING, Field.FieldRole.TIMESTAMP, 3);
//    strTimestamp.setLogicalType(LogicalType.TIMESTAMP);
//    strTimestamp.setFormat("{  \n" +
//                               "            \"type\":\"time_format\",\n" +
//                               "            \"format\":\"yyyyMMdd\",\n" +
//                               "            \"timeZone\":\"Asia/Seoul\",\n" +
//                               "            \"locale\":\"en\"\n" +
//                               "         }");
//    fields.add(strTimestamp);

    printIncrementalQuery(implementor, fields, batchIngestionInfo, limitDateStr);
  }

  @Test
  public void timestampFieldHiveTable(){
    String implementor = "HIVE";

    String limitDateStr = "2018-07-01 00:00:00";
    String sql = "default.lineage;";

    //create incremental query
    BatchIngestionInfo batchIngestionInfo = new BatchIngestionInfo();
    batchIngestionInfo.setDataType(JdbcIngestionInfo.DataType.TABLE);
    batchIngestionInfo.setQuery(sql);
    batchIngestionInfo.setMaxLimit(1000);

    List<Field> fields = new ArrayList<>();

    Field msUnixTime = new Field("lineage.eventtime", DataType.INTEGER, Field.FieldRole.TIMESTAMP, 0);
    msUnixTime.setLogicalType(LogicalType.TIMESTAMP);
    msUnixTime.setFormat("{  \n" +
                             "            \"type\":\"time_unix\",\n" +
                             "            \"timeZone\":\"UTC\",\n" +
                             "            \"locale\":\"en\",\n" +
                             "            \"unit\":\"MILLISECOND\",\n" +
                             "            \"format\":\"yyyy-MM-dd HH:mm:ss\"\n" +
                             "         }");
    fields.add(msUnixTime);

    printIncrementalQuery(implementor, fields, batchIngestionInfo, limitDateStr);
  }

  public void printIncrementalQuery(String implementor, List<Field> fields, BatchIngestionInfo batchIngestionInfo, String targetDate){
    for(Field field : fields){
      System.out.println("-- " + implementor + "(" + field.getName() + ")");
      String incrementalQuery = new SelectQueryBuilder(getDataConnection(implementor), getDialect(implementor))
          .projection(fields)
          .query(batchIngestionInfo, null)
          .incremental(field, targetDate)
          .limit(0, batchIngestionInfo.getMaxLimit())
          .build();

      System.out.println(incrementalQuery + ";");
    }
  }
}

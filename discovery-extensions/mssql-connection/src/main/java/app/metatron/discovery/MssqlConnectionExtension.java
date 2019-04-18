package app.metatron.discovery;

import org.pf4j.Extension;
import org.pf4j.Plugin;
import org.pf4j.PluginWrapper;
import org.apache.commons.lang3.StringUtils;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.exception.FunctionWithException;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.AbstractJdbcDataAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

/**
 *
 */
public class MssqlConnectionExtension extends Plugin {
  public MssqlConnectionExtension(PluginWrapper wrapper) {
    super(wrapper);
  }

  @Override
  public void start() {
    System.out.println("Mssql Connection Extension Start");
  }

  @Override
  public void stop() {
    System.out.println("Mssql Connection Extension Stop");
  }

  @Extension
  public static class MssqlDataAccessor extends AbstractJdbcDataAccessor{

  }

  @Extension
  public static class MssqlDialect implements JdbcDialect{

    private static final String MSSQL_URL_PREFIX = "jdbc:sqlserver:/";
    private static final String[] EXCLUDE_SCHEMAS = {"master", "tempdb", "model", "msdb"};
    private static final String[] EXCLUDE_TABLES = null;

    @Override
    public String getName() {
      return "MSSQL";
    }

    @Override
    public Scope getScope() {
      return Scope.EXTENSION;
    }

    @Override
    public String getIconResource1() {
      return "/extensions/mssql-connection-extension/ic_db_mssql.png";
    }

    @Override
    public String getIconResource2() {
      return "/extensions/mssql-connection-extension/ic_db_mssql_w.png";
    }

    @Override
    public String getIconResource3() {
      return "/extensions/mssql-connection-extension/ic_db_mssql_b.png";
    }

    @Override
    public String getIconResource4() {
      return null;
    }

    @Override
    public String getImplementor() {
      return "MSSQL";
    }

    @Override
    public InputSpec getInputSpec() {
      return (new InputSpec())
          .setAuthenticationType(InputMandatory.MANDATORY)
          .setUsername(InputMandatory.MANDATORY)
          .setPassword(InputMandatory.MANDATORY)
          .setCatalog(InputMandatory.NONE)
          .setSid(InputMandatory.NONE)
          .setDatabase(InputMandatory.MANDATORY);
    }

    @Override
    public boolean isSupportImplementor(JdbcConnectInformation connectInfo, String implementor) {
      return implementor.toUpperCase().equals(getImplementor().toUpperCase());
    }

    @Override
    public String getDriverClass(JdbcConnectInformation connectInfo) {
      return "com.microsoft.sqlserver.jdbc.SQLServerDriver";
    }

    @Override
    public String getConnectorClass(JdbcConnectInformation connectInfo) {
      return null;
    }

    @Override
    public String getDataAccessorClass(JdbcConnectInformation connectInfo) {
      return "app.metatron.discovery.MssqlConnectionExtension$MssqlDataAccessor";
    }

    @Override
    public String getConnectUrl(JdbcConnectInformation connectInfo) {
      return makeConnectUrl(connectInfo, connectInfo.getDatabase(), true);
    }

    @Override
    public String makeConnectUrl(JdbcConnectInformation connectInfo, String database, boolean includeDatabase) {
      if(StringUtils.isNotEmpty(connectInfo.getUrl())) {
        return connectInfo.getUrl();
      }

      StringBuilder builder = new StringBuilder();
      builder.append(MSSQL_URL_PREFIX);

      // Set HostName
      builder.append(URL_SEP);
      builder.append(connectInfo.getHostname());

      // Set Port
      if(connectInfo.getPort() != null) {
        builder.append(":").append(connectInfo.getPort());
      }

      // Set DataBase
      if(StringUtils.isNotEmpty(connectInfo.getDatabase()) && includeDatabase) {
        builder.append(";");
        builder.append("database=");
        builder.append(connectInfo.getDatabase());
      }

      return builder.toString();
    }

    @Override
    public String getTestQuery(JdbcConnectInformation connectInfo) {
      return "SELECT 1";
    }

    @Override
    public String getDataBaseQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas, Integer pageSize, Integer pageNumber) {
      StringBuilder builder = new StringBuilder();

      if(pageSize != null && pageNumber != null){
        int fromIndex = (pageNumber * pageSize) + 1;
        int toIndex = (pageNumber + 1) * pageSize;

        builder.append(" SELECT A.name ");
        builder.append(" FROM (");
        builder.append("   SELECT name, ROW_NUMBER() OVER(ORDER BY name ASC) AS NUM ");
        builder.append("   FROM sys.databases ");
        builder.append("   WHERE 1=1 ");
        if(StringUtils.isNotEmpty(databaseNamePattern)){
          builder.append("   AND name LIKE '%" + databaseNamePattern + "%' ");
        }
        if(excludeSchemas != null && excludeSchemas.size() > 0){
          builder.append("   AND name NOT IN ( ");
          for(int i = 0; i < excludeSchemas.size(); ++i){
            if(i > 0){
              builder.append(",");
            }
            builder.append("'" + excludeSchemas.get(i) + "'");
          }
          builder.append(" ) ");
        }
        builder.append(" ) A ");
        builder.append(" WHERE A.NUM BETWEEN " + fromIndex + " AND " + toIndex);
      } else {
        builder.append(" SELECT name ");
        builder.append(" FROM sys.databases ");
        builder.append(" WHERE 1=1 ");
        if(StringUtils.isNotEmpty(databaseNamePattern)){
          builder.append(" AND name LIKE '%" + databaseNamePattern + "%' ");
        }
        if(excludeSchemas != null && excludeSchemas.size() > 0){
          builder.append("   AND name NOT IN ( ");
          for(int i = 0; i < excludeSchemas.size(); ++i){
            if(i > 0){
              builder.append(",");
            }
            builder.append("'" + excludeSchemas.get(i) + "'");
          }
          builder.append(" ) ");
        }
        builder.append(" ORDER BY name ");
      }
      builder.append(";");
      return builder.toString();
    }

    @Override
    public String getDataBaseCountQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas) {
      StringBuilder builder = new StringBuilder();

      builder.append(" SELECT COUNT(name) ");
      builder.append(" FROM sys.databases ");
      builder.append(" WHERE 1=1 ");
      if(StringUtils.isNotEmpty(databaseNamePattern)){
        builder.append(" AND name LIKE '%" + databaseNamePattern + "%' ");
      }
      if(excludeSchemas != null && excludeSchemas.size() > 0) {
        builder.append(" AND name NOT IN ( ");
        for (int i = 0; i < excludeSchemas.size(); ++i) {
          if (i > 0) {
            builder.append(",");
          }
          builder.append("'" + excludeSchemas.get(i) + "'");
        }
        builder.append(" ) ");
      }
      builder.append(";");
      return builder.toString();
    }

    @Override
    public String getUseDatabaseQuery(JdbcConnectInformation connectInfo, String database) {
      return null;
//      return "USE " + database;
    }

    @Override
    public String[] getDefaultExcludeSchemas(JdbcConnectInformation connectInfo) {
      return EXCLUDE_SCHEMAS;
    }

    @Override
    public String getTableNameQuery(JdbcConnectInformation connectInfo, String catalog, String schema) {
      return null;
    }

    @Override
    public String getTableQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables, Integer pageSize, Integer pageNumber) {
      StringBuilder builder = new StringBuilder();
      if(StringUtils.isEmpty(catalog)) {
        catalog = "dbo";
      }

      if(pageSize != null && pageNumber != null){
        int fromIndex = (pageNumber * pageSize) + 1;
        int toIndex = (pageNumber + 1) * pageSize;

        builder.append(" SELECT A.table_name name, A.table_type type ");
        builder.append("   FROM (");
        builder.append("   SELECT table_name, table_type, ROW_NUMBER() OVER(ORDER BY table_name ASC) AS NUM ");
        builder.append("   FROM information_schema.tables ");
        builder.append("   WHERE table_type='BASE TABLE' ");
        builder.append("     AND table_schema = '" + catalog + "' ");
        builder.append("     AND table_catalog = '" + schema + "' ");
        if(StringUtils.isNotEmpty(tableNamePattern)){
          builder.append("     AND table_name LIKE '%" + tableNamePattern + "%' ");
        }
        if(excludeTables != null && excludeTables.size() > 0){
          builder.append("     AND table_name NOT IN ( ");
          for(int i = 0; i < excludeTables.size(); ++i){
            if(i > 0){
              builder.append(",");
            }
            builder.append("'" + excludeTables.get(i) + "'");
          }
          builder.append("     ) ");
        }
        builder.append(" ) A ");
        builder.append(" WHERE A.NUM BETWEEN " + fromIndex + " AND " + toIndex);
      } else {
        builder.append(" SELECT table_name name, table_type type ");
        builder.append(" FROM information_schema.tables ");
        builder.append(" WHERE table_type='BASE TABLE' ");
        builder.append("   AND table_schema = '" + schema + "' ");
        if(StringUtils.isNotEmpty(tableNamePattern)){
          builder.append("   AND table_name LIKE '%" + tableNamePattern + "%' ");
        }
        if(excludeTables != null && excludeTables.size() > 0){
          builder.append("     AND table_name NOT IN ( ");
          for(int i = 0; i < excludeTables.size(); ++i){
            if(i > 0){
              builder.append(",");
            }
            builder.append("'" + excludeTables.get(i) + "'");
          }
          builder.append("     ) ");
        }
        builder.append(" ORDER BY table_name ");
      }
      builder.append(";");
      return builder.toString();
    }

    @Override
    public String getTableCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables) {
      if(StringUtils.isEmpty(schema)) {
        schema = "dbo";
      }

      StringBuilder builder = new StringBuilder();
      builder.append(" SELECT COUNT(table_name) ");
      builder.append(" FROM information_schema.tables ");
      builder.append(" WHERE table_type='BASE TABLE' ");
      builder.append("   AND table_schema = '" + schema + "' ");
      if(StringUtils.isNotEmpty(tableNamePattern)){
        builder.append("   AND table_name LIKE '%" + tableNamePattern + "%' ");
      }
      if(excludeTables != null && excludeTables.size() > 0){
        builder.append("     AND table_name NOT IN ( ");
        for(int i = 0; i < excludeTables.size(); ++i){
          if(i > 0){
            builder.append(",");
          }
          builder.append("'" + excludeTables.get(i) + "'");
        }
        builder.append("     ) ");
      }
      return builder.toString();
    }

    @Override
    public String getTableDescQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
      return "SELECT \n" +
          "    t.name AS TableName,\n" +
          "    s.name AS SchemaName,\n" +
          "    t.create_date as CreateDate,\n " +
          "    t.modify_date as ModifyDate,\n" +
          "    p.rows AS RowCounts,\n" +
          "    SUM(a.total_pages) * 8 AS TotalSpaceKB, \n" +
          "    CAST(ROUND(((SUM(a.total_pages) * 8) / 1024.00), 2) AS NUMERIC(36, 2)) AS TotalSpaceMB,\n" +
          "    SUM(a.used_pages) * 8 AS UsedSpaceKB, \n" +
          "    CAST(ROUND(((SUM(a.used_pages) * 8) / 1024.00), 2) AS NUMERIC(36, 2)) AS UsedSpaceMB, \n" +
          "    (SUM(a.total_pages) - SUM(a.used_pages)) * 8 AS UnusedSpaceKB,\n" +
          "    CAST(ROUND(((SUM(a.total_pages) - SUM(a.used_pages)) * 8) / 1024.00, 2) AS NUMERIC(36, 2)) AS UnusedSpaceMB\n" +
          "FROM \n" +
          "    sys.tables t\n" +
          "INNER JOIN      \n" +
          "    sys.indexes i ON t.OBJECT_ID = i.object_id\n" +
          "INNER JOIN \n" +
          "    sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id\n" +
          "INNER JOIN \n" +
          "    sys.allocation_units a ON p.partition_id = a.container_id\n" +
          "LEFT OUTER JOIN \n" +
          "    sys.schemas s ON t.schema_id = s.schema_id\n" +
          "WHERE \n" +
          "    t.NAME NOT LIKE 'dt%' \n" +
          "    AND t.NAME LIKE '" + table + "' \n" +
          "    AND s.NAME LIKE '" + schema + "' \n" +
          "    AND t.is_ms_shipped = 0\n" +
          "    AND i.OBJECT_ID > 255 \n" +
          "GROUP BY \n" +
          "    t.Name, s.Name, t.create_date, t.modify_date, p.Rows\n" +
          "ORDER BY \n" +
          "    t.Name";
    }

    @Override
    public String[] getDefaultExcludeTables(JdbcConnectInformation connectInfo) {
      return EXCLUDE_TABLES;
    }

    @Override
    public String[] getResultSetTableType(JdbcConnectInformation connectInfo) {
      return RESULTSET_TABLE_TYPES;
    }

    @Override
    public String getColumnQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern, Integer pageSize, Integer pageNumber) {
      return null;
    }

    @Override
    public String getColumnCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern) {
      return null;
    }

    @Override
    public FunctionWithException<Object, Object, SQLException> resultObjectConverter() throws SQLException {
      return originalObj -> {
        if(originalObj instanceof Timestamp){
          return originalObj.toString();
        } else {
          return originalObj;
        }
      };
    }

    @Override
    public String getTableName(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
      if(StringUtils.isEmpty(schema) || schema.equals(connectInfo.getDatabase())) {
        return table;
      }
      return schema + "." + table;
    }

    @Override
    public String getQuotedFieldName(JdbcConnectInformation connectInfo, String fieldName) {
      return fieldName;
    }

    @Override
    public String getDefaultTimeFormat(JdbcConnectInformation connectInfo) {
      return "YYYY-MM-DD HH24:MI:SS";
    }

    @Override
    public String getCharToDateStmt(JdbcConnectInformation connectInfo, String timeStr, String timeFormat) {
      StringBuilder builder = new StringBuilder();
      builder.append("TO_DATE('").append(timeStr).append("', ");

      builder.append("'");
      if(DEFAULT_FORMAT.equals(timeFormat)) {
        builder.append(getDefaultTimeFormat(connectInfo));
      } else {
        builder.append(timeFormat).append("'");
      }
      builder.append("'");
      builder.append(") ");

      return builder.toString();
    }

    @Override
    public String getCurrentTimeStamp(JdbcConnectInformation connectInfo) {
      return "TO_CHAR(NOW(), '" + getDefaultTimeFormat(connectInfo) + "') AS TIMESTAMP";
    }
  }
}

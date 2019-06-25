package app.metatron.discovery;

import oracle.sql.TIMESTAMP;

import org.apache.commons.lang3.StringUtils;
import org.pf4j.Extension;
import org.pf4j.Plugin;
import org.pf4j.PluginWrapper;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import app.metatron.discovery.common.exception.FunctionWithException;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.AbstractJdbcDataAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;


/**
 *
 */
public class OracleConnectionExtension extends Plugin {
  public OracleConnectionExtension(PluginWrapper wrapper) {
    super(wrapper);
  }

  @Override
  public void start() {
    System.out.println("Oracle Connection Extension Start");
  }

  @Override
  public void stop() {
    System.out.println("Oracle Connection Extension Stop");
  }

  @Extension
  public static class OracleDataAccessor extends AbstractJdbcDataAccessor{

  }

  @Extension
  public static class OracleDialect implements JdbcDialect{

    private static final String ORCLE_URL_PREFIX = "jdbc:oracle:thin:@/";
    private static final String[] EXCLUDE_SCHEMAS = null;
    private static final String[] EXCLUDE_TABLES = null;

    @Override
    public String getName() {
      return "Oracle";
    }

    @Override
    public Scope getScope() {
      return Scope.EXTENSION;
    }

    @Override
    public String getIconResource1() {
      return "/extensions/oracle-connection-extension/ic_db_oracle.png";
    }

    @Override
    public String getIconResource2() {
      return "/extensions/oracle-connection-extension/ic_db_oracle_w.png";
    }

    @Override
    public String getIconResource3() {
      return "/extensions/oracle-connection-extension/ic_db_oracle_b.png";
    }

    @Override
    public String getIconResource4() {
      return null;
    }

    @Override
    public String getImplementor() {
      return "ORACLE";
    }

    @Override
    public InputSpec getInputSpec() {
      return (new InputSpec())
          .setAuthenticationType(InputMandatory.MANDATORY)
          .setUsername(InputMandatory.MANDATORY)
          .setPassword(InputMandatory.MANDATORY)
          .setCatalog(InputMandatory.NONE)
          .setSid(InputMandatory.MANDATORY)
          .setDatabase(InputMandatory.NONE);
    }

    @Override
    public boolean isSupportImplementor(String implementor) {
      return implementor.toUpperCase().equals(getImplementor().toUpperCase());
    }

    @Override
    public String getDriverClass(JdbcConnectInformation connectInfo) {
      return "oracle.jdbc.OracleDriver";
    }

    @Override
    public String getConnectorClass(JdbcConnectInformation connectInfo) {
      return null;
    }

    @Override
    public String getDataAccessorClass(JdbcConnectInformation connectInfo) {
      return "app.metatron.discovery.OracleConnectionExtension$OracleDataAccessor";
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
      builder.append(ORCLE_URL_PREFIX);

      // Set HostName
      builder.append(URL_SEP);
      builder.append(connectInfo.getHostname());

      // Set Port
      if(connectInfo.getPort() != null) {
        builder.append(":").append(connectInfo.getPort());
      }

      builder.append(URL_SEP);

      // Set Sid
      builder.append(connectInfo.getSid());

      return builder.toString();
    }

    @Override
    public String getTestQuery(JdbcConnectInformation connectInfo) {
      return "SELECT 1 FROM DUAL";
    }

    @Override
    public String getDataBaseQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas, Integer pageSize, Integer pageNumber) {
      StringBuilder builder = new StringBuilder();
      if(pageSize != null && pageNumber != null){
        int fromIndex = (pageNumber * pageSize) + 1;
        int toIndex = (pageNumber + 1) * pageSize;

        builder.append(" SELECT username ");
        builder.append(" FROM (");
        builder.append("   SELECT username, ROW_NUMBER() OVER(ORDER BY username ASC) AS NUM ");
        builder.append("   FROM dba_users ");
        builder.append("   WHERE default_tablespace NOT IN ('SYSTEM','SYSAUX') ");
        builder.append("     AND account_status='OPEN' ");
        if(StringUtils.isNotEmpty(databaseNamePattern)){
          builder.append("   AND LOWER(username) LIKE LOWER('%" + databaseNamePattern + "%')");
        }
        if(excludeSchemas != null && excludeSchemas.size() > 0){
          builder.append(" AND LOWER(username) NOT IN ( ");
          builder.append("'" + StringUtils.join(excludeSchemas, "','").toLowerCase() + "'");
          builder.append(" ) ");
        }
        builder.append("   ORDER BY username ");
        builder.append(" ) ");
        builder.append(" WHERE NUM BETWEEN " + fromIndex + " AND " + toIndex);
      } else {
        builder.append(" SELECT username ");
        builder.append(" FROM dba_users ");
        builder.append(" WHERE default_tablespace NOT IN ('SYSTEM','SYSAUX') ");
        builder.append("   AND account_status='OPEN' ");
        if(StringUtils.isNotEmpty(databaseNamePattern)){
          builder.append("  AND LOWER(username) LIKE LOWER('%" + databaseNamePattern + "%')");
        }
        if(excludeSchemas != null && excludeSchemas.size() > 0){
          builder.append(" AND LOWER(username) NOT IN ( ");
          builder.append("'" + StringUtils.join(excludeSchemas, "','").toLowerCase() + "'");
          builder.append(" ) ");
        }
        builder.append(" ORDER BY username )");
      }

      return builder.toString();
    }

    @Override
    public String getDataBaseCountQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas) {
      StringBuilder builder = new StringBuilder();
      builder.append("SELECT COUNT(username) AS COUNT FROM dba_users WHERE default_tablespace NOT IN ('SYSTEM','SYSAUX') AND account_status='OPEN'");

      if(excludeSchemas != null && excludeSchemas.size() > 0){
        builder.append(" AND LOWER(username) NOT IN ( ");
        builder.append("'" + StringUtils.join(excludeSchemas, "','").toLowerCase() + "'");
        builder.append(" ) ");
      }

      if(StringUtils.isNotEmpty(databaseNamePattern)){
        builder.append(" AND LOWER(username) LIKE LOWER('%" + databaseNamePattern + "%')");
      }

      return builder.toString();
    }

    @Override
    public String getUseDatabaseQuery(JdbcConnectInformation connectInfo, String database) {
      return "ALTER SESSION SET CURRENT_SCHEMA = " + database;
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
      if(pageSize != null && pageNumber != null){
        int fromIndex = (pageNumber * pageSize) + 1;
        int toIndex = (pageNumber + 1) * pageSize;

        builder.append(" SELECT OBJECT_NAME name, OBJECT_TYPE type ");
        builder.append(" FROM (");
        builder.append("   SELECT DISTINCT OBJECT_NAME, OBJECT_TYPE, ROW_NUMBER() OVER(ORDER BY OBJECT_NAME ASC) AS NUM ");
        builder.append("   FROM ALL_OBJECTS ");
        builder.append("   WHERE OBJECT_TYPE='TABLE' ");
        builder.append("   AND OWNER='" + schema + "' ");
        if(StringUtils.isNotEmpty(tableNamePattern)){
          builder.append("    AND LOWER(OBJECT_NAME) LIKE LOWER('%" + tableNamePattern + "%')");
        }
        if(excludeTables != null && excludeTables.size() > 0){
          builder.append(" AND LOWER(OBJECT_NAME) NOT IN ( ");
          builder.append("'" + StringUtils.join(excludeTables, "','").toLowerCase() + "'");
          builder.append(" ) ");
        }
        builder.append("   ORDER BY OBJECT_NAME ");
        builder.append(" ) ");
        builder.append(" WHERE NUM BETWEEN " + fromIndex + " AND " + toIndex);
      } else {
        builder.append(" SELECT DISTINCT OBJECT_NAME name, OBJECT_TYPE type ");
        builder.append(" FROM ALL_OBJECTS ");
        builder.append(" WHERE OBJECT_TYPE='TABLE' ");
        builder.append(" AND OWNER='" + schema + "' ");
        if(StringUtils.isNotEmpty(tableNamePattern)){
          builder.append("  AND LOWER(OBJECT_NAME) LIKE LOWER('%" + tableNamePattern + "%')");
        }
        if(excludeTables != null && excludeTables.size() > 0){
          builder.append(" AND LOWER(OBJECT_NAME) NOT IN ( ");
          builder.append("'" + StringUtils.join(excludeTables, "','").toLowerCase() + "'");
          builder.append(" ) ");
        }
        builder.append(" ORDER BY OBJECT_NAME ");
      }

      return builder.toString();
    }

    @Override
    public String getTableCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables) {
      StringBuilder builder = new StringBuilder();
      builder.append(" SELECT COUNT(DISTINCT OBJECT_NAME) ");
      builder.append(" FROM ALL_OBJECTS ");
      builder.append(" WHERE OBJECT_TYPE='TABLE' ");
      builder.append(" AND OWNER='" + schema + "' ");
      if(StringUtils.isNotEmpty(tableNamePattern)){
        builder.append("  AND LOWER(OBJECT_NAME) LIKE LOWER('%" + tableNamePattern + "%')");
      }
      if(excludeTables != null && excludeTables.size() > 0){
        builder.append(" AND LOWER(OBJECT_NAME) NOT IN ( ");
        builder.append("'" + StringUtils.join(excludeTables, "','").toLowerCase() + "'");
        builder.append(" ) ");
      }
      return builder.toString();
    }

    @Override
    public String getTableDescQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
      StringBuilder builder = new StringBuilder();
      builder.append(" SELECT * ");
      builder.append(" FROM ALL_TABLES T ");
      builder.append(" WHERE 1=1 ");
      if(StringUtils.isNotEmpty(schema)){
        builder.append(" AND T.OWNER = UPPER('" + schema + "') ");
      }
      if(StringUtils.isNotEmpty(table)){
        builder.append(" AND T.TABLE_NAME = UPPER('" + table + "') ");
      }
      return builder.toString();
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
      return "SELECT cname, coltype FROM col WHERE tname='" + table + "'";
    }

    @Override
    public String getColumnCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table, String columnNamePattern) {
      return null;
    }

    @Override
    public FunctionWithException<Object, Object, SQLException> resultObjectConverter() {
      return originalObj -> {
        if(originalObj instanceof TIMESTAMP){
          TIMESTAMP timestamp = (TIMESTAMP) originalObj;
          return timestamp.timestampValue().toString();
        } else if(originalObj instanceof Timestamp){
          return originalObj.toString();
        } else {
          return originalObj;
        }
      };
    }

    @Override
    public String getTableName(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
      if(StringUtils.isEmpty(schema) || schema.equals(connectInfo.getSid())) {
        return table;
      }
      return schema + "." + table;
    }

    @Override
    public String getQuotedFieldName(JdbcConnectInformation connectInfo, String fieldName) {
      return Arrays.stream(fieldName.split("\\."))
                   .map(spliced -> "\"" + spliced + "\"")
                   .collect(Collectors.joining("."));
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
    public String getCharToUnixTimeStmt(JdbcConnectInformation jdbcConnectInformation, String s) {
      return s;
    }
  }
}

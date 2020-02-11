package app.metatron.discovery;

import org.apache.commons.lang3.StringUtils;
import org.pf4j.Extension;
import org.pf4j.Plugin;
import org.pf4j.PluginWrapper;

import java.sql.SQLException;
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
public class AthenaConnectionExtension extends Plugin {
  public AthenaConnectionExtension(PluginWrapper wrapper) {
    super(wrapper);
  }

  @Override
  public void start() {}

  @Override
  public void stop() {}

  @Extension
  public static class AthenaDataAccessor extends AbstractJdbcDataAccessor{

  }

  @Extension
  public static class AthenaDialect implements JdbcDialect{

    private static final String[] EXCLUDE_SCHEMAS = null;
    private static final String[] EXCLUDE_TABLES = null;

    @Override
    public String getName() {
      return "Athena";
    }

    @Override
    public Scope getScope() {
      return Scope.EXTENSION;
    }

    @Override
    public String getIconResource1() {
      return null;
    }

    @Override
    public String getIconResource2() {
      return null;
    }

    @Override
    public String getIconResource3() {
      return null;
    }

    @Override
    public String getIconResource4() {
      return null;
    }

    @Override
    public String getImplementor() {
      return "ATHENA";
    }

    @Override
    public InputSpec getInputSpec() {
      return (new InputSpec())
          .setAuthenticationType(InputMandatory.MANDATORY)
          .setUsername(InputMandatory.OPTIONAL)
          .setPassword(InputMandatory.OPTIONAL)
          .setCatalog(InputMandatory.NONE)
          .setSid(InputMandatory.NONE)
          .setDatabase(InputMandatory.NONE);
    }

    @Override
    public boolean isSupportImplementor(String implementor) {
      return implementor.toUpperCase().equals(getImplementor().toUpperCase());
    }

    @Override
    public String getDriverClass(JdbcConnectInformation connectInfo) {
      return "com.simba.athena.jdbc.Driver";
    }

    @Override
    public String getConnectorClass(JdbcConnectInformation connectInfo) {
      return null;
    }

    @Override
    public String getDataAccessorClass(JdbcConnectInformation connectInfo) {
      return "app.metatron.discovery.AthenaConnectionExtension$AthenaDataAccessor";
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
      builder.append("jdbc:awsathena:/");

      // Set HostName
      builder.append(URL_SEP);
      builder.append(connectInfo.getHostname());

      // Set Port
      if(connectInfo.getPort() != null) {
        builder.append(":").append(connectInfo.getPort());
      }

      return builder.toString();
    }

    @Override
    public String getTestQuery(JdbcConnectInformation connectInfo) {
      return "SELECT 1";
    }

    @Override
    public String getDataBaseQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas, Integer pageSize, Integer pageNumber) {
      return null;
    }

    @Override
    public String getDataBaseCountQuery(JdbcConnectInformation connectInfo, String catalog, String databaseNamePattern, List<String> excludeSchemas) {
      return null;
    }

    @Override
    public String getUseDatabaseQuery(JdbcConnectInformation connectInfo, String database) {
      return null;
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
      return null;
    }

    @Override
    public String getTableCountQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String tableNamePattern, List<String> excludeTables) {
      return null;
    }

    @Override
    public String getTableDescQuery(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
      return null;
    }

    @Override
    public String[] getDefaultExcludeTables(JdbcConnectInformation connectInfo) {
      return EXCLUDE_TABLES;
    }

    @Override
    public String[] getResultSetTableType(JdbcConnectInformation connectInfo) {
      return null;
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
      return null;
    }

    @Override
    public String getTableName(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
      if(StringUtils.isEmpty(schema) || schema.equals(connectInfo.getDatabase())) {
        return table;
      }
      return "\"" + schema + "\".\"" + table + "\"";
    }

    @Override
    public String getQuotedFieldName(JdbcConnectInformation connectInfo, String fieldName) {
      return Arrays.stream(fieldName.split("\\."))
                   .map(spliced -> "\"" + spliced + "\"")
                   .collect(Collectors.joining("."));
    }

    @Override
    public String getDefaultTimeFormat(JdbcConnectInformation connectInfo) {
      return "yyyy-MM-dd HH:mm:ss";
    }

    @Override
    public String getCharToDateStmt(JdbcConnectInformation connectInfo, String timeStr, String timeFormat) {
      StringBuilder builder = new StringBuilder();

      builder.append("parse_datetime(").append(timeStr).append(", ");
      builder.append("'");
      if(DEFAULT_FORMAT.equals(timeFormat)) {
        builder.append(getDefaultTimeFormat(connectInfo));
      } else {
        builder.append(timeFormat);
      }
      builder.append("'");
      builder.append(") ");

      return builder.toString();
    }

    @Override
    public String getCharToUnixTimeStmt(JdbcConnectInformation connectInfo, String timeStr) {
      return "to_unixtime(cast(" + timeStr + " as timestamp))";
    }
  }
}

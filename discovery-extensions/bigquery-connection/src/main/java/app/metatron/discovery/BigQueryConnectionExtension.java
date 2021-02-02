package app.metatron.discovery;

import org.pf4j.Extension;
import org.pf4j.Plugin;
import org.pf4j.PluginWrapper;
import org.apache.commons.lang3.StringUtils;

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
public class BigQueryConnectionExtension extends Plugin {
  public BigQueryConnectionExtension(PluginWrapper wrapper) {
    super(wrapper);
  }

  @Override
  public void start() {}

  @Override
  public void stop() {}

  @Extension
  public static class BigQueryDataAccessor extends AbstractJdbcDataAccessor{

  }

  @Extension
  public static class BigQueryDialect implements JdbcDialect{

    private static final String[] EXCLUDE_SCHEMAS = null;
    private static final String[] EXCLUDE_TABLES = null;

    @Override
    public String getName() {
      return "BigQuery";
    }

    @Override
    public Scope getScope() {
      return Scope.EXTENSION;
    }

    @Override
    public String getIconResource1() {
//      return "/extensions/welcome-connection-extension/ic_db_custom.png";
      return null;
    }

    @Override
    public String getIconResource2() {
//      return "/extensions/welcome-connection-extension/ic_db_custom_w.png";
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
      return "BIGQUERY";
    }

    @Override
    public InputSpec getInputSpec() {
      return (new InputSpec())
          .setAuthenticationType(InputMandatory.NONE)
          .setUsername(InputMandatory.NONE)
          .setPassword(InputMandatory.NONE)
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
      return "com.simba.googlebigquery.jdbc42.Driver";
    }

    @Override
    public String getConnectorClass(JdbcConnectInformation connectInfo) {
      return null;
    }

    @Override
    public String getDataAccessorClass(JdbcConnectInformation connectInfo) {
      return "app.metatron.discovery.BigQueryConnectionExtension$BigQueryDataAccessor";
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
      builder.append("jdbc:bigquery:/");

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
      return null;
    }

    @Override
    public String getTableName(JdbcConnectInformation connectInfo, String catalog, String schema, String table) {
      if(StringUtils.isEmpty(schema)) {
        return table;
      }
      return schema + "." + table;
    }

    @Override
    public String getQuotedFieldName(JdbcConnectInformation connectInfo, String fieldName) {
      return Arrays.stream(fieldName.split("\\."))
                   .map(spliced -> "`" + spliced + "`")
                   .collect(Collectors.joining("."));
    }

    @Override
    public String getDefaultTimeFormat(JdbcConnectInformation connectInfo) {
      return null;
    }

    @Override
    public String getCharToDateStmt(JdbcConnectInformation connectInfo, String timeStr, String timeFormat) {
      StringBuilder builder = new StringBuilder();
      builder.append("CAST(").append(timeStr).append(" AS DATETIME) ");
      return builder.toString();
    }

    @Override
    public String getCharToUnixTimeStmt(JdbcConnectInformation connectInfo, String timeStr) {
      return "UNIX_SECONDS(TIMESTAMP(" + timeStr + "))";
    }
  }
}

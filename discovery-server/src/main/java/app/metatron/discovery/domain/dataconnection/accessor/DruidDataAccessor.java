package app.metatron.discovery.domain.dataconnection.accessor;

import org.pf4j.Extension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.extension.dataconnection.jdbc.accessor.AbstractJdbcDataAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

@Extension
public class DruidDataAccessor extends AbstractJdbcDataAccessor {

  private static final Logger LOGGER = LoggerFactory.getLogger(DruidDataAccessor.class);

  @Override
  public void useDatabase(String catalog, String database) {
    LOGGER.debug("Druid does not support USE statements.");
  }

  @Override
  public Map<String, Object> getDatabases(String catalog, String schemaPattern, Integer pageSize, Integer pageNumber) {
    Map<String, Object> databaseMap = new LinkedHashMap<>();
    List<String> databaseNames = null;

    String schemaListQuery = dialect.getDataBaseQuery(connectionInfo, catalog, schemaPattern, getExcludeSchemas(), pageSize, pageNumber);
    LOGGER.debug("Execute Schema List query : {}", schemaListQuery);

    try {
      databaseNames = executeQueryForList(this.getConnection(), schemaListQuery, (resultSet, rowNum) -> resultSet.getString(1));
    } catch (Exception e) {
      LOGGER.error("Fail to get list of database : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    }

    List<String> excludeSchemas = getExcludeSchemas();
    if (excludeSchemas != null) {
      //filter after query execute for hive
      databaseNames = databaseNames.stream()
                                   .filter(databaseName -> excludeSchemas.indexOf(databaseName) < 0)
                                   .collect(Collectors.toList());
    }

    int databaseCount = databaseNames.size();

    databaseMap.put("databases", databaseNames);
    databaseMap.put("page", createPageInfoMap(databaseCount, databaseCount, 0));
    return databaseMap;
  }
}

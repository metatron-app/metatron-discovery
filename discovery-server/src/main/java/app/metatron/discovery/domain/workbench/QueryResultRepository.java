package app.metatron.discovery.domain.workbench;

import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;

public interface QueryResultRepository {
  void save(JdbcDataConnection jdbcDataConnection, String metatronUserId, String queryEditorId, QueryResult queryResult);
  void delete(JdbcDataConnection jdbcDataConnection, String metatronUserId, String queryEditorId);
  QueryResultMetaData findMetaData(JdbcDataConnection jdbcDataConnection, String loginUserId, String queryEditorId, String auditId);
}

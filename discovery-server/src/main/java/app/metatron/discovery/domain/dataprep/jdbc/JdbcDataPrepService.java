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

package app.metatron.discovery.domain.dataprep.jdbc;

import app.metatron.discovery.common.datasource.DataType;
import com.google.common.base.Joiner;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.*;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.SelectQueryBuilder;

public class JdbcDataPrepService extends JdbcConnectionService{
    private static final Logger LOGGER = LoggerFactory.getLogger(JdbcDataPrepService.class);

    public JdbcDataPrepService() { super();}

    public JdbcDataConnection makeJdbcDataConnection(DataConnection dataConnection) {
        JdbcDataConnection jdbcDataConnection = null;
        String implementor = dataConnection.getImplementor();
        switch(implementor) {
            case "ORACLE": jdbcDataConnection = new OracleConnection(); break;
            case "MYSQL": jdbcDataConnection = new MySQLConnection(); break;
            case "POSTGRESQL": jdbcDataConnection = new PostgresqlConnection(); break;
            case "HIVE": jdbcDataConnection = new HiveConnection(); break;
            case "PRESTO": jdbcDataConnection = new PrestoConnection(); break;
            case "TIBERO": jdbcDataConnection = new TiberoConnection(); break;
        }

        jdbcDataConnection.setUrl(dataConnection.getUrl());
        jdbcDataConnection.setOptions(dataConnection.getOptions());
        jdbcDataConnection.setDatabase(dataConnection.getDatabase());
        jdbcDataConnection.setHostname(dataConnection.getHostname());
        jdbcDataConnection.setUsername(dataConnection.getUsername());
        jdbcDataConnection.setPassword(dataConnection.getPassword());
        jdbcDataConnection.setPort(dataConnection.getPort());

        return jdbcDataConnection;
    }

    public List<List<Object>> selectQueryToResultSet(JdbcDataConnection connection,
                                               String schema,
                                               JdbcIngestionInfo.DataType type,
                                               String query,
                                               int limit, String dsId) {
        return selectQueryToResultSet(connection, getDataSource(connection, true), schema, type, query, limit, dsId);
    }

    public JdbcJsonReturn selectAsJson(JdbcDataConnection connection, String query, int limit) {
        DataSource dataSource = getDataSource(connection, true);

        Statement stmt = null;
        ResultSet rs = null;
        ResultSetMetaData rsmd;
        List<String> json = new ArrayList<>();
        List<String> meta = new ArrayList<>();
        //List<com.sk.eddy.types.DataType> types = new ArrayList<>();

        try {
            stmt = dataSource.getConnection().createStatement();
            rs = stmt.executeQuery(query);
            rsmd = rs.getMetaData();

            int colcnt = rsmd.getColumnCount();
            String[] colnames = new String[colcnt + 1];
            Boolean[] useQuotes = new Boolean[colcnt + 1];

            for (int i = 1; i <= colcnt; i++) {
                colnames[i] = rsmd.getColumnName(i);
                if (colnames[i].contains(".")) {
                    colnames[i] = colnames[i].substring(colnames[i].indexOf(".") + 1);
                }
                switch (rsmd.getColumnType(i)) {
                  case java.sql.Types.BIT:
                  case java.sql.Types.TINYINT:
                  case java.sql.Types.SMALLINT:
                  case java.sql.Types.INTEGER:
                  case java.sql.Types.BIGINT:
                  case java.sql.Types.FLOAT:
                  case java.sql.Types.REAL:
                  case java.sql.Types.DOUBLE:
                  case java.sql.Types.NUMERIC:
                  case java.sql.Types.DECIMAL:
                  case java.sql.Types.BOOLEAN:
                    useQuotes[i] = false;
                    break;
                  default:
                    useQuotes[i] = true;
                }
                meta.add(colnames[i]);
                //types.add(DataType.jdbcToEddyType(rsmd.getColumnType(i)));
            }

            Joiner commaJoiner = Joiner.on(",");

            while (rs.next()) {
              List<String> resultBits = new ArrayList<>();
              for (int i = 1; i <= colcnt; i++) {
                StringBuilder resultBit = new StringBuilder();

                if (useQuotes[i]) {
                  resultBit.append("\"").append(colnames[i]).append("\": \"").append(rs.getString(i)).append("\"");
                } else {
                  resultBit.append("\"").append(colnames[i]).append("\": ").append(rs.getString(i));
                }
                resultBits.add(resultBit.toString());
              }
              json.add(" { " + commaJoiner.join(resultBits) + " } ");

              if (limit != -1 && --limit <= 0)
                break;
            }

        } catch (Exception e) {
            String line = String.format("Fail to query (selectAsJson) : sql=[%s] msg=[%s]", query, e.getMessage());
            LOGGER.error(line);
            if (System.getProperty("dataprep").equals("disabled")) {
              throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE, PrepMessageKey.MSG_DP_ALERT_INVALID_CONFIG_CODE);
            } else {
              throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE, line);
            }
        } finally {
            closeConnection(dataSource, rs, stmt);
        }

        return new JdbcJsonReturn(json, meta);//, types);
    }

    public List<List<Object>> selectQueryToResultSet(JdbcDataConnection connection,
                                                              DataSource dataSource,
                                                              String schema,
                                                              JdbcIngestionInfo.DataType type,
                                                              String query,
                                                              int limit, String dsId) {

        // int totalRows = countOfSelectQuery(connection, ingestion);

        JdbcQueryResultResponse queryResultSet = null;

        String queryString = new SelectQueryBuilder(connection)
                .allProjection()
                .query(schema, type, query)
                .limit(0, limit)
                .build();

        LOGGER.debug("Query : {} ", queryString);

        Statement stmt = null;
        ResultSet rs = null;
        ResultSetMetaData rsmd = null;
        List<List<Object>> colNameTypes = new ArrayList<>();
        try {
            stmt = dataSource.getConnection().createStatement();
            rs = stmt.executeQuery(queryString);
            rsmd = rs.getMetaData();
            for (int i = 1; i <= rsmd.getColumnCount(); i++) {
              List<Object> colNameType = new ArrayList<>();
              colNameType.add(rsmd.getColumnName(i).replace("ttb.", ""));
              colNameType.add(DataType.jdbcToFieldType(rsmd.getColumnType(i)));
              colNameTypes.add(colNameType);
            }
            convertToCsv(rs, dsId);
        } catch (Exception e) {
            LOGGER.error("Fail to query for select :  {}", e.getMessage());
            throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                    "Fail to query : " + e.getMessage());
        } finally {
            closeConnection(dataSource, rs, stmt);
        }

        return colNameTypes;
    }

    public String convertToCsv(ResultSet rs, String dsId) throws SQLException, IOException, InterruptedException {
        String fileName = "/tmp/dataprep_" + dsId;
        File file = new File(fileName);
        file.createNewFile();
        PrintWriter csvWriter = new PrintWriter(file) ;
        ResultSetMetaData meta = rs.getMetaData() ;
        int numberOfColumns = meta.getColumnCount() ;
//        String dataHeaders = "\"" + meta.getColumnName(1).replaceAll("ttb." , "") + "\"" ;
//        for (int i = 2 ; i < numberOfColumns + 1 ; i ++ ) {
//            dataHeaders += "\u0001\"" + meta.getColumnName(i).replaceAll("ttb." , "").replaceAll("\"","\\\"") + "\"" ;
//        }
//        csvWriter.println(dataHeaders) ;
        while (rs.next()) {
            String row = "";
            if (rs.getString(1) != null)
                row += rs.getString(1).replaceAll("\"","\\\"") + "";
            for (int i = 2 ; i < numberOfColumns + 1 ; i ++ ) {
                if (rs.getString(i) != null)
                    row += "\u0001" + rs.getString(i).replaceAll("\"","\\\"") + "";
                else
                    row += "\u0001" + "";
            }
            csvWriter.println(row);
            csvWriter.flush();
        }
        csvWriter.close();

        String cmd = "hdfs dfs -copyFromLocal " + fileName + " /tmp";
        Process p = Runtime.getRuntime().exec(cmd);
        p.waitFor();

        if(file.exists())
            file.delete();

        return fileName;
    }
}

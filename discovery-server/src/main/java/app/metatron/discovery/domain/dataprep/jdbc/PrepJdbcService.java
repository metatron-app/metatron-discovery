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

import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.*;

public class PrepJdbcService extends JdbcConnectionService {
    public PrepJdbcService() { super();}

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
            case "DRUID": jdbcDataConnection = new DruidConnection(); break;
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
}

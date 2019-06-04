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

package app.metatron.discovery.domain.mdm;

import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcCSVWriter;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.mdm.source.MetaSourceService;
import app.metatron.discovery.domain.mdm.source.MetadataSource;
import app.metatron.discovery.domain.storage.StorageProperties;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.supercsv.prefs.CsvPreference;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.Statement;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;


@Component
@Transactional
public class MetadataService {

    private static Logger LOGGER = LoggerFactory.getLogger(MetadataService.class);
    @Autowired
    MetaSourceService metaSourceService;
    @Autowired
    StorageProperties storageProperties;
    @Autowired
    EngineProperties engineProperties;
    @Autowired
    private MetadataRepository metadataRepository;

    /**
     * find metadata from datasource identifier
     */
    @Transactional(readOnly = true)
    public Optional <Metadata> findByDataSource(String dataSourceId) {
        List <Metadata> results = metadataRepository.findBySource(dataSourceId, null, null);
        if (CollectionUtils.isEmpty(results)) {
            return Optional.empty();
        }

        return Optional.of(results.get(0));
    }

    /**
     * Save using datasource information
     */
    public void saveFromDataSource(DataSource dataSource) {
        // make metadata from datasource
        Metadata metadata = new Metadata(dataSource);

        metadataRepository.saveAndFlush(metadata);

        LOGGER.info("Successfully saved metadata({}) from datasource({})", metadata.getId(), dataSource.getId());
    }

    /**
     * Update from updated datasource
     */
    public void updateFromDataSource(DataSource dataSource, boolean includeFields) {

        Optional <Metadata> metadata = findByDataSource(dataSource.getId());
        if (!metadata.isPresent()) {
            return;
        }

        Metadata updateMetadata = metadata.get();
        updateMetadata.updateFromDataSource(dataSource, includeFields);

        metadataRepository.save(updateMetadata);
    }

    /**
     * Delete metadata
     */
    public void delete(String... metadataIds) {

        int deleteCnt = 0;
        for (String metadataId : metadataIds) {
            Metadata deletingMetadata = metadataRepository.findOne(metadataId);
            if (deletingMetadata == null) {
                continue;
            }
            metadataRepository.delete(metadataId);
            deleteCnt++;
        }

        LOGGER.info("Successfully delete {} metadata items", deleteCnt);
    }

    public DataFrame getDataFame(Metadata metadata, int limit) {
        DataFrame dataFrame = new DataFrame();
        Statement stmt = null;
        Connection conn = null;

        String query = makeQueryStatement(metadata);

        try {
            conn = getConnection(metadata);
            stmt = conn.createStatement();
        } catch (Exception e) {
            e.printStackTrace();
            LOGGER.error("getDataFame : createStatement Exception " + e.getMessage());
        }

        try {
            dataFrame.setByJDBC(stmt, query, limit);
        } catch (Exception e) {
            LOGGER.error("getDataFame :  dataFrame.setByJDBC Exception " + e.getMessage());
        }

        return dataFrame;
    }

    public void getDownloadData(Metadata metadata, String fileName, int limit) {
        Connection conn = null;

        String query = makeQueryStatement(metadata);
        conn = getConnection(metadata);

        try {
            createCSVFile(conn, query, fileName, limit);
        } catch (Exception e) {
            LOGGER.error("getDownloadData : createCSVFile Exception " + e.getMessage());
        }
    }

    private Connection getConnection(Metadata metadata) {
        MetadataSource metadataSource = metadata.getSource();
        Connection conn = null;

        if (metadataSource.getType() == Metadata.SourceType.JDBC) {

            if (StringUtils.isEmpty(metadataSource.getSourceId())) {
                throw new IllegalArgumentException("DataConnection info. required.");
            }

            DataConnection jdbcDataConnection = (DataConnection) metaSourceService
                    .getSourcesBySourceId(metadataSource.getType(), metadataSource.getSourceId());

            JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(jdbcDataConnection);
            try {
                conn = jdbcDataAccessor.getConnection();
            } catch (Exception e) {
                LOGGER.error("getConnection : [Type] Metadata.SourceType.JDBC Exception " + e.getMessage());
            }

        } else if (metadataSource.getType() == Metadata.SourceType.ENGINE) { // druid

            DataConnection jdbcDataConnection = new DataConnection();
            jdbcDataConnection.setImplementor("DRUID");
            jdbcDataConnection.setUrl(makeDruidEngineConnectUrl());

            JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(jdbcDataConnection);
            try {
                conn = jdbcDataAccessor.getConnection();
            } catch (Exception e) {
                LOGGER.error("getConnection : [Type] Metadata.SourceType.ENGINE Exception " + e.getMessage());
            }

        } else if (metadataSource.getType() == Metadata.SourceType.STAGEDB) {
            StorageProperties.StageDBConnection stageDBConnection = storageProperties.getStagedb();

            if (stageDBConnection == null) {
                throw new IllegalArgumentException("Staging Hive DB info. required.");
            }

            DataConnection hiveConnection = new DataConnection();
            hiveConnection.setUrl(stageDBConnection.getUrl());
            hiveConnection.setHostname(stageDBConnection.getHostname());
            hiveConnection.setPort(stageDBConnection.getPort());
            hiveConnection.setUsername(stageDBConnection.getUsername());
            hiveConnection.setPassword(stageDBConnection.getPassword());
            hiveConnection.setImplementor("STAGE");

            JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(hiveConnection);

            try {
                conn = jdbcDataAccessor.getConnection();
            } catch (Exception e) {
                LOGGER.error("getConnection : [Type] Metadata.SourceType.STAGEDB Exception " + e.getMessage());
            }
        }

        if (conn == null) {
            throw new IllegalArgumentException("getConnection is null : " + metadataSource.getSourceId());
        }

        return conn;
    }

    public String getDownloadFilePath(String fileName) {
        String downloadFilePath = null;
        String fileDownalodLocalPath = System.getProperty("user.home") + File.separator + "metadatas" + File.separator + "downloads";

        File file = new File(fileDownalodLocalPath);
        if (!file.exists()) {
            file.mkdirs();
        }

        downloadFilePath = fileDownalodLocalPath + File.separator + fileName + "_" + Calendar.getInstance().getTime().getTime() + ".csv";

        if (downloadFilePath == null) {
            throw new IllegalArgumentException("getDownloadFilePath() : downloadFilePath is null ");
        }

        return downloadFilePath;
    }

    private void createCSVFile(Connection connection, String query, String fileName, int limit) throws IOException {

        try {
            JdbcCSVWriter jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(fileName), CsvPreference.STANDARD_PREFERENCE);
            jdbcCSVWriter.setConnection(connection);
            jdbcCSVWriter.setFetchSize(limit);
            jdbcCSVWriter.setMaxRow(1000);
            jdbcCSVWriter.setQuery(query);
            jdbcCSVWriter.setFileName(fileName);
            jdbcCSVWriter.write();
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    private String makeDruidEngineConnectUrl() {

        String druidHost = engineProperties.getHostname().get("broker");
        StringBuilder stringBuilder = new StringBuilder();

        stringBuilder.append("jdbc:avatica:remote:url=")
                .append(druidHost)
                .append("/druid/v2/sql/avatica/");

        return stringBuilder.toString();
    }

    private String makeQueryStatement(Metadata metadata) {
        MetadataSource metadataSource = metadata.getSource();
        String schema = metadataSource.getSchema();
        String tableName = metadataSource.getTable();

        StringBuilder query = new StringBuilder();

        query.append("select * from ");
        if (schema != null && !schema.isEmpty()) {
            query.append(schema).append(".");
        }
        if (metadataSource.getType() == Metadata.SourceType.ENGINE) {
            query.append(metadataSource.getName());
        } else {
            query.append(tableName);
        }

        return query.toString();
    }

}

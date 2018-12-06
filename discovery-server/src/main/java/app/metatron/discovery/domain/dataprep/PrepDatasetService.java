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

package app.metatron.discovery.domain.dataprep;

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.DataConnectionRepository;
import com.google.common.collect.Maps;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.Map;


@Service
@Transactional
public class PrepDatasetService {
    @Autowired
    PrepPreviewLineService previewLineService;

    @Autowired
    private PrepHdfsService hdfsService;

    @Autowired
    private PrepDatasetFileService datasetFilePreviewService;

    @Autowired
    private PrepDatasetSparkHiveService datasetSparkHivePreviewService;

    @Autowired
    private PrepDatasetJdbcService datasetJdbcPreviewService;

    @Autowired
    private DataConnectionRepository dataConnectionRepository;

    private String filePreviewSize = "2000";
    private String hivePreviewSize = "50";
    private String jdbcPreviewSize = "50";

    public DataFrame getImportedPreview(PrepDataset dataset) throws Exception {
        DataFrame dataFrame = null;

        PrepDataset.IMPORT_TYPE importType = dataset.getImportTypeEnum();
        if(importType == PrepDataset.IMPORT_TYPE.FILE) {
            dataFrame = this.datasetFilePreviewService.getPreviewLinesFromFileForDataFrame(dataset, dataset.getFilekey(), "0", this.filePreviewSize);
        } else if(importType == PrepDataset.IMPORT_TYPE.HIVE) {
            dataFrame = this.datasetSparkHivePreviewService.getPreviewLinesFromStagedbForDataFrame(dataset, this.hivePreviewSize);
        } else if(importType == PrepDataset.IMPORT_TYPE.DB) {
            dataFrame = this.datasetJdbcPreviewService.getPreviewLinesFromJdbcForDataFrame(dataset, this.jdbcPreviewSize);
        }

        return dataFrame;
    }

    public void savePreview(PrepDataset dataset, String oAuthToken) throws Exception {
        DataFrame dataFrame = null;

        PrepDataset.IMPORT_TYPE importType = dataset.getImportTypeEnum();
        if(importType == PrepDataset.IMPORT_TYPE.FILE) {
            dataFrame = subFileType(dataset);
        } else if(importType == PrepDataset.IMPORT_TYPE.HIVE) {
            this.datasetSparkHivePreviewService.setoAuthToekn(oAuthToken);
            dataFrame = this.datasetSparkHivePreviewService.getPreviewLinesFromStagedbForDataFrame(dataset, this.hivePreviewSize);
        } else if(importType == PrepDataset.IMPORT_TYPE.DB) {
            this.datasetJdbcPreviewService.setoAuthToekn(oAuthToken);
            dataFrame = this.datasetJdbcPreviewService.getPreviewLinesFromJdbcForDataFrame(dataset, this.jdbcPreviewSize);
        }

        if(dataFrame!=null) {
            int size = this.previewLineService.putPreviewLines(dataset.getDsId(), dataFrame);
        }
    }

    public DataFrame subFileType(PrepDataset dataset) throws Exception {
        String filekey = dataset.getFilekey();
        String sheetName = dataset.getSheetName();
        String delimiter = dataset.getDelimiter();

        if (filekey == null) {
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_KEY_MISSING,
                    String.format("dsName=%s fileType=%s filePath=%s", dataset.getDsName(),
                            dataset.getCustomValue("fileType"), dataset.getCustomValue("filePath")));
        }

        if(true==dataset.isEXCEL()) {
            String csvFileName = this.datasetFilePreviewService.moveExcelToCsv(filekey,sheetName,delimiter);
            dataset.putCustomValue("filePath", csvFileName);
            int lastIdx = csvFileName.lastIndexOf(File.separator);
            String newFileKey = csvFileName.substring(lastIdx+1);
            dataset.setFilekey(newFileKey);
            filekey = newFileKey;
        } else if(true==dataset.isJSON()) {
            String csvFileName = this.datasetFilePreviewService.moveJsonToCsv(filekey, null, delimiter);
            dataset.putCustomValue("filePath", csvFileName);
            int lastIdx = csvFileName.lastIndexOf(File.separator);
            String newFileKey = csvFileName.substring(lastIdx+1);
            dataset.setFilekey(newFileKey);
            filekey = newFileKey;
        }

        if(dataset.getFileTypeEnum() == PrepDataset.FILE_TYPE.HDFS) {
            if (false == dataset.getCustomValue("filePath").toLowerCase().startsWith("hdfs://")) {
                String localFilePath = dataset.getCustomValue("filePath");
                String hdfsFilePath = this.hdfsService.moveLocalToHdfs(localFilePath, filekey);
                if (null != hdfsFilePath) {
                    dataset.putCustomValue("filePath", hdfsFilePath);
                    dataset.setFileType(PrepDataset.FILE_TYPE.HDFS);
                } else {
                    throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_HADOOP_NOT_CONFIGURED, hdfsFilePath);
                }
            }
        }

        return this.datasetFilePreviewService.getPreviewLinesFromFileForDataFrame(dataset, filekey, "0", this.filePreviewSize);
    }

    public Map<String,Object> getConnectionInfo(String dcId) {
        Map<String,Object> connectionInfo = null;
        if(null!=dcId) {
            DataConnection dataConnection = this.dataConnectionRepository.getOne(dcId);

            // hibernate lazy problem
            /*
            DataConnection lazyDataConnection = this.dataConnectionRepository.getOne(dcId);
            Hibernate.initialize(lazyDataConnection);
            if (lazyDataConnection instanceof HibernateProxy) {
                dataConnection = (DataConnection) ((HibernateProxy) lazyDataConnection).getHibernateLazyInitializer().getImplementation();
            }
            if( dataConnection == null ) {
                dataConnection = lazyDataConnection;
            }
            */

            if(null!=dataConnection) {
                connectionInfo = Maps.newHashMap();

                connectionInfo.put("implementor", dataConnection.getImplementor());
                connectionInfo.put("name", dataConnection.getName());
                connectionInfo.put("description", dataConnection.getDescription());
                connectionInfo.put("url", dataConnection.getUrl());
                connectionInfo.put("database", dataConnection.getDatabase());
                connectionInfo.put("hostname", dataConnection.getHostname());
                connectionInfo.put("username", dataConnection.getUsername());
                connectionInfo.put("port", dataConnection.getPort());
            }
        }
        return connectionInfo;
    }
}

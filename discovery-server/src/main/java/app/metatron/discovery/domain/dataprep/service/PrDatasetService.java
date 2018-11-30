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

package app.metatron.discovery.domain.dataprep.service;

import app.metatron.discovery.domain.dataprep.*;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
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

import java.util.Map;


@Service
@Transactional
public class PrDatasetService {
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

    public DataFrame getImportedPreview(PrDataset dataset) throws Exception {
        DataFrame dataFrame = null;

        PrDataset.IMPORT_TYPE importType = dataset.getImportType();
        if(importType == PrDataset.IMPORT_TYPE.UPLOAD || importType == PrDataset.IMPORT_TYPE.URI) {
            dataFrame = this.datasetFilePreviewService.getPreviewLinesFromFileForDataFrame(dataset, "0", this.filePreviewSize);
        } else if(importType == PrDataset.IMPORT_TYPE.DATABASE) {
            dataFrame = this.datasetJdbcPreviewService.getPreviewLinesFromJdbcForDataFrame(dataset, this.jdbcPreviewSize);
        } else if(importType == PrDataset.IMPORT_TYPE.STAGING_DB) {
            dataFrame = this.datasetSparkHivePreviewService.getPreviewLinesFromStagedbForDataFrame(dataset, this.hivePreviewSize);
        } else {
            assert false : importType;
        }

        return dataFrame;
    }

    public void savePreview(PrDataset dataset, String oAuthToken) throws Exception {
        DataFrame dataFrame = null;

        PrDataset.IMPORT_TYPE importType = dataset.getImportType();
        if(importType == PrDataset.IMPORT_TYPE.UPLOAD || importType == PrDataset.IMPORT_TYPE.URI) {
            dataFrame = changeExcelToCsvAndPutPreview(dataset);
        } else if(importType == PrDataset.IMPORT_TYPE.DATABASE) {
            this.datasetJdbcPreviewService.setoAuthToekn(oAuthToken);
            dataFrame = this.datasetJdbcPreviewService.getPreviewLinesFromJdbcForDataFrame(dataset, this.jdbcPreviewSize);
        } else if(importType == PrDataset.IMPORT_TYPE.STAGING_DB) {
            this.datasetSparkHivePreviewService.setoAuthToekn(oAuthToken);
            dataFrame = this.datasetSparkHivePreviewService.getPreviewLinesFromStagedbForDataFrame(dataset, this.hivePreviewSize);
        }

        if(dataFrame!=null) {
            int size = this.previewLineService.putPreviewLines(dataset.getDsId(), dataFrame);
        }
    }

    public DataFrame changeExcelToCsvAndPutPreview(PrDataset dataset) throws Exception {
        String storedUri = dataset.getStoredUri();
        String sheetName = dataset.getSheetName();
        String delimiter = dataset.getDelimiter();

        if (storedUri == null) {
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_KEY_MISSING,
                    String.format("dsName=%s fileFormat=%s storedUri=%s", dataset.getDsName(),
                            dataset.getFileFormat(), storedUri));
        }

        if(dataset.getFileFormat() == PrDataset.FILE_FORMAT.EXCEL) {
//            String csvFileName = this.datasetFilePreviewService.moveExcelToCsv(storedUri,sheetName,delimiter);
            String csvStrUri = this.datasetFilePreviewService.moveExcelToCsv(storedUri,sheetName,delimiter);
//            dataset.putCustomValue("filePath", csvFileName);
//            int lastIdx = csvFileName.lastIndexOf(File.separator);
//            String newFileKey = csvFileName.substring(lastIdx+1);
//            dataset.setFilekey(newFileKey);
//            filekey = newFileKey;
            dataset.setStoredUri(csvStrUri);
        }

//        assert dataset.getStorageType() != PrDataset.STORAGE_TYPE.HDFS;

//        if(dataset.getFileTypeEnum() == PrDataset.FILE_TYPE.HDFS) {
//            if (false == dataset.getCustomValue("filePath").toLowerCase().startsWith("hdfs://")) {
//                String localFilePath = dataset.getCustomValue("filePath");
//                String hdfsFilePath = this.hdfsService.moveLocalToHdfs(localFilePath, filekey);
//                if (null != hdfsFilePath) {
//                    dataset.putCustomValue("filePath", hdfsFilePath);
//                    dataset.setFileType(PrDataset.FILE_TYPE.HDFS);
//                } else {
//                    throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_HADOOP_NOT_CONFIGURED, hdfsFilePath);
//                }
//            }
//        }

        return this.datasetFilePreviewService.getPreviewLinesFromFileForDataFrame(dataset, "0", this.filePreviewSize);
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

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
import org.apache.commons.io.FilenameUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import java.io.File;
import java.util.Map;


@Service
@Transactional
public class PrDatasetService {
    private static Logger LOGGER = LoggerFactory.getLogger(PrDatasetService.class);

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
            dataFrame = this.datasetFilePreviewService.getPreviewLinesFromFileForDataFrame(dataset, "0", this.filePreviewSize);
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

    public void changeFileFormatToCsv(PrDataset dataset) throws Exception {
        String storedUri = dataset.getStoredUri();
        String sheetName = dataset.getSheetName();
        String delimiter = dataset.getDelimiter();

        if (storedUri == null) {
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_KEY_MISSING,
                    String.format("dsName=%s fileFormat=%s storedUri=%s", dataset.getDsName(),
                            dataset.getFileFormat(), storedUri));
        }

        String csvStrUri = null;
        if(dataset.getFileFormat() == PrDataset.FILE_FORMAT.EXCEL) {
            csvStrUri = this.datasetFilePreviewService.moveExcelToCsv(storedUri, sheetName, delimiter);
        } else if(dataset.getFileFormat() == PrDataset.FILE_FORMAT.JSON) {
            csvStrUri = this.datasetFilePreviewService.moveJsonToCsv(storedUri, null, delimiter);
        }
        if(csvStrUri!=null) {
            dataset.setStoredUri(csvStrUri);
        }

        return;
    }

    /*
    public void uploadFileToStorage(PrDataset dataset) throws Exception {
        String storedUri = dataset.getStoredUri();

        if (storedUri == null) {
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_KEY_MISSING,
                    String.format("storedUri=%s", storedUri));
        }

        if(dataset.getStorageType() == PrDataset.STORAGE_TYPE.HDFS) {
            uploadFileToHdfs(dataset);
        } else if(dataset.getStorageType() == PrDataset.STORAGE_TYPE.FTP) {
            // Will be implemented in the future
        } else if(dataset.getStorageType() == PrDataset.STORAGE_TYPE.S3) {
            // Will be implemented in the future
        } else if(dataset.getStorageType() == PrDataset.STORAGE_TYPE.BLOB) {
            // Will be implemented in the future
        } else {
            // nothing to do. PrDataset.STORAGE_TYPE.LOCAL
        }

        return;
    }
    */

    public void uploadFileToStorage(PrDataset dataset, String storageType) throws Exception {
        String storedUri = dataset.getStoredUri();

        if (storedUri == null) {
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_FILE_KEY_MISSING,
                    String.format("storedUri=%s", storedUri));
        }

        if(storageType.equalsIgnoreCase(PrDataset.STORAGE_TYPE.HDFS.name())) {
            uploadFileToHdfs(dataset);
        } else if(storageType.equalsIgnoreCase(PrDataset.STORAGE_TYPE.FTP.name())) {
            // Will be implemented in the future
        } else if(storageType.equalsIgnoreCase(PrDataset.STORAGE_TYPE.S3.name())) {
            // Will be implemented in the future
        } else if(storageType.equalsIgnoreCase(PrDataset.STORAGE_TYPE.BLOB.name())) {
            // Will be implemented in the future
        } else {
            // nothing to do. PrDataset.STORAGE_TYPE.LOCAL
        }

        return;
    }

    public void uploadFileToHdfs(PrDataset dataset) throws Exception {
        String storedUri = dataset.getStoredUri();

        Map<String, Object> check = this.hdfsService.checkHdfs();
        if(check.get("stagingBaseDir")!=null) {
            Configuration conf = this.hdfsService.getConf();
            FileSystem fs = FileSystem.get(conf);

            String uploadPath = this.hdfsService.getUploadPath();
            if (null != uploadPath) {
                String fileName = FilenameUtils.getName(storedUri);
                String hdfsStoredUri = uploadPath + File.separator + fileName;

                Path pathLocalFile = new Path(storedUri);
                Path pathHdfsFile = new Path(hdfsStoredUri);

                Path pathStagingBase = pathHdfsFile.getParent();
                if( false==fs.exists(pathStagingBase) ) {
                    fs.mkdirs(pathStagingBase);
                }

                fs.copyFromLocalFile(true, true, pathLocalFile, pathHdfsFile);

                dataset.setStoredUri(hdfsStoredUri);
            } else {
                throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_HADOOP_NOT_CONFIGURED, "dataprep.stagingBaseDir");
            }
        } else {
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_HADOOP_NOT_CONFIGURED, "dataprep.hadoopConfDir");
        }

        return;
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

    public void afterCreate(PrDataset dataset, String storageType) throws PrepException {
        try {

            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String oAuthToken = "bearer ";
            Cookie[] cookies = request.getCookies();
            for(int i=0; i<cookies.length; i++){
                if(cookies[i].getName().equals("LOGIN_TOKEN"))
                    oAuthToken = oAuthToken + cookies[i].getValue();
            }

            // excel to csv
            // below the file format is always csv
            if(dataset.getImportType() == PrDataset.IMPORT_TYPE.UPLOAD || dataset.getImportType() == PrDataset.IMPORT_TYPE.URI) {
                this.changeFileFormatToCsv(dataset);
            }

            // upload file to storage
            if(dataset.getImportType() == PrDataset.IMPORT_TYPE.UPLOAD) {
                this.uploadFileToStorage(dataset, storageType);
            }

            this.savePreview(dataset, oAuthToken);

        } catch (Exception e) {
            LOGGER.error("afterCreate(): caught an exception: ", e);
            throw PrepException.create(PrepErrorCodes.PREP_DATASET_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_DATASET_FAILED_AFTERCREATE, e.getMessage());
        }

    }

    public void setConnectionInfo(PrDataset dataset) throws PrepException {
        String dcId = dataset.getDcId();
        if(null!=dcId) {
            DataConnection dataConnection = this.dataConnectionRepository.getOne(dcId);

            dataset.setDcName(dataConnection.getName());
            dataset.setDcDesc(dataConnection.getDescription());
            dataset.setDcImplementor(dataConnection.getImplementor());
            dataset.setDcOptions(dataConnection.getOptions());
            dataset.setDcType(dataConnection.getType().name());
            dataset.setDcAuthenticationType(dataConnection.getAuthenticationType().name());
            dataset.setDcHostname(dataConnection.getHostname());
            dataset.setDcPort(dataConnection.getPort());
            dataset.setDcUsername(dataConnection.getUsername());
            dataset.setDcPassword(dataConnection.getPassword());
            dataset.setDcUrl(dataConnection.getUrl());
            dataset.setDcConnectUrl(dataConnection.getConnectUrl());
            dataset.setDcPublished(dataConnection.getPublished());
        }
    }
}

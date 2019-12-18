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

import static app.metatron.discovery.domain.dataprep.entity.PrDataset.IMPORT_TYPE.UPLOAD;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_FILE_KEY_MISSING;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_IMPORT_TYPE_IS_WRONG;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.datasetError;
import static org.apache.commons.io.FilenameUtils.getExtension;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;
import app.metatron.discovery.domain.dataprep.PrepDatasetDatabaseService;
import app.metatron.discovery.domain.dataprep.PrepDatasetFileService;
import app.metatron.discovery.domain.dataprep.PrepDatasetStagingDbService;
import app.metatron.discovery.domain.dataprep.PrepPreviewLineService;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import org.hibernate.Hibernate;
import org.hibernate.proxy.HibernateProxy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PrDatasetService {

  private static Logger LOGGER = LoggerFactory.getLogger(PrDatasetService.class);

  @Autowired
  PrepPreviewLineService previewLineService;

  @Autowired
  private PrepDatasetFileService prepDatasetFileService;

  @Autowired
  private PrepDatasetStagingDbService datasetStagingDbPreviewService;

  @Autowired
  private PrepDatasetDatabaseService datasetJdbcPreviewService;

  @Autowired
  private DataConnectionRepository dataConnectionRepository;

  private String filePreviewSize = "50";
  private String hivePreviewSize = "50";
  private String jdbcPreviewSize = "50";

  public DataFrame getImportedPreview(PrDataset dataset) throws IOException, SQLException, TeddyException {
    DataFrame dataFrame;

    assert dataset.getDsType() == PrDataset.DS_TYPE.IMPORTED : dataset.getDsType();

    switch (dataset.getImportType()) {
      case UPLOAD:
      case URI:
        dataFrame = prepDatasetFileService.getPreviewLinesFromFileForDataFrame(dataset, filePreviewSize);
        break;
      case DATABASE:
        dataFrame = datasetJdbcPreviewService.getPreviewLinesFromJdbcForDataFrame(dataset, jdbcPreviewSize);
        break;
      case STAGING_DB:
        dataFrame = datasetStagingDbPreviewService.getPreviewLinesFromStagedbForDataFrame(dataset, hivePreviewSize);
        break;
      default:
        throw datasetError(MSG_DP_ALERT_IMPORT_TYPE_IS_WRONG, dataset.getImportType().name());
    }

    return dataFrame;
  }

  public void changeFileFormatToCsv(PrDataset dataset) throws Exception {
    String storedUri = dataset.getStoredUri();
    String sheetName = dataset.getSheetName();
    String delimiter = dataset.getDelimiter();
    String csvStrUri;

    if (storedUri == null) {
      throw datasetError(MSG_DP_ALERT_FILE_KEY_MISSING, "dsName=" + dataset.getDsName());
    }

    if (getExtension(storedUri).equals("xls") || getExtension(storedUri).equals("xlsx")) {
      if (dataset.getImportType() == UPLOAD) {
        csvStrUri = prepDatasetFileService.moveExcelToCsv(storedUri, sheetName, delimiter);
      } else {
        csvStrUri = prepDatasetFileService.getPathLocalBase(dataset.getDsId() + ".csv");
        csvStrUri = prepDatasetFileService.moveExcelToCsv(csvStrUri, storedUri, sheetName, delimiter);
      }
      dataset.setStoredUri(csvStrUri);
    }
  }

  public DataConnection findRealDataConnection(DataConnection lazyOne) {
    DataConnection realOne = null;
    Hibernate.initialize(lazyOne);
    if (lazyOne instanceof HibernateProxy) {
      realOne = (DataConnection) ((HibernateProxy) lazyOne).getHibernateLazyInitializer().getImplementation();
    }
    if (realOne == null) {
      return (DataConnection) lazyOne;
    }
    return (DataConnection) realOne;
  }

  public void setConnectionInfo(PrDataset dataset) throws PrepException {
    String dcId = dataset.getDcId();
    if (dcId != null) {
      DataConnection dataConnection = findRealDataConnection(dataConnectionRepository.getOne(dcId));

      dataset.setDcName(dataConnection.getName());
      dataset.setDcDesc(dataConnection.getDescription());
      dataset.setDcImplementor(dataConnection.getImplementor());
      dataset.setDcOptions(dataConnection.getOptions());
      dataset.setDcType(dataConnection.getType().name());
      if (null != dataConnection.getAuthenticationType()) {
        dataset.setDcAuthenticationType(dataConnection.getAuthenticationType().name());
      }
      dataset.setDcHostname(dataConnection.getHostname());
      dataset.setDcPort(dataConnection.getPort());
      dataset.setDcUsername(dataConnection.getUsername());
      dataset.setDcPassword(dataConnection.getPassword());
      dataset.setDcUrl(dataConnection.getUrl());
      //dataset.setDcConnectUrl(dataConnection.getConnectUrl());
      dataset.setDcPublished(dataConnection.getPublished());
    }
  }

  public void patchAllowedOnly(PrDataset dataset, PrDataset patchDataset) {
    // Dataset editing is not yet supported.
    // Only a few fields are allowed to be changed.
    // It can be changed.

    List<String> allowKeys = Lists.newArrayList();
    allowKeys.add("dsName");
    allowKeys.add("dsDesc");
    allowKeys.add("totalLines");
    allowKeys.add("totalBytes");

    List<String> ignoreKeys = Lists.newArrayList();
    ignoreKeys.add("dsId");
    ignoreKeys.add("refDfCount");

    if (patchDataset.getDsName() != null) {
      dataset.setDsName(patchDataset.getDsName());
    }
    if (patchDataset.getDsDesc() != null) {
      dataset.setDsDesc(patchDataset.getDsDesc());
    }
    if (patchDataset.getTotalBytes() != null) {
      dataset.setTotalBytes(patchDataset.getTotalBytes());
    }
    if (patchDataset.getTotalLines() != null) {
      dataset.setTotalLines(patchDataset.getTotalLines());
    }

    ObjectMapper objectMapper = GlobalObjectMapper.getDefaultMapper();
    Map<String, Object> mapDataset = objectMapper.convertValue(patchDataset, Map.class);
    for (String key : mapDataset.keySet()) {
      if (!ignoreKeys.contains(key)) {
        continue;
      }

      if (!allowKeys.contains(key)) {
        LOGGER.debug("'" + key + "' of pr-dataset is an attribute to which patch is not applied");
      }
    }
  }
}

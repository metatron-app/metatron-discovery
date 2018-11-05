package app.metatron.discovery.domain.datasource.ingestion.job;

import com.google.common.collect.Lists;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOption;
import app.metatron.discovery.domain.datasource.ingestion.LocalFileIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.file.CsvFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.ExcelFileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;
import app.metatron.discovery.domain.datasource.ingestion.file.JsonFileFormat;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.spec.druid.ingestion.BatchIndex;
import app.metatron.discovery.spec.druid.ingestion.Index;
import app.metatron.discovery.spec.druid.ingestion.IngestionSpec;
import app.metatron.discovery.spec.druid.ingestion.IngestionSpecBuilder;
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.DataSourceErrorCodes.INGESTION_FILE_EXCEL_CONVERSION_ERROR;

public class FileIngestionJob extends AbstractIngestionJob implements IngestionJob {

  private static final Logger LOGGER = LoggerFactory.getLogger(FileIngestionJob.class);

  private LocalFileIngestionInfo localFileInfo;

  private String srcFilePath;

  private String loadFileName;

  private Index indexSpec;

  public FileIngestionJob(DataSource dataSource, IngestionHistory ingestionHistory) {
    super(dataSource, ingestionHistory);
    localFileInfo = dataSource.getIngestionInfoByType();
  }

  @Override
  public void preparation() {

    EngineProperties.IngestionInfo ingestionInfo = engineProperties.getIngestion();

    if (StringUtils.isNotEmpty(localFileInfo.getOriginalFileName())) {
      srcFilePath = System.getProperty("java.io.tmpdir") + File.separator + localFileInfo.getPath();
    } else {
      srcFilePath = localFileInfo.getPath();
      localFileInfo.setOriginalFileName(FilenameUtils.getName(srcFilePath));
    }

    loadFileName = createDestFileName(dataSource.getEngineName(), localFileInfo.getFormat());
    Path destFilePath = Paths.get(ingestionInfo.getBaseDir(), loadFileName);

    if(localFileInfo.getFormat() instanceof ExcelFileFormat) {

      if (localFileInfo.getFormat() instanceof ExcelFileFormat) {
        boolean removeFirstRow = localFileInfo.getRemoveFirstRow();

        ExcelFileFormat excelFileFormat = (ExcelFileFormat) localFileInfo.getFormat();
        try {
          PolarisUtils.convertExcelToCSV(excelFileFormat.getSheetIndex(), removeFirstRow, srcFilePath, destFilePath.toString());
        } catch (Exception e) {
          LOGGER.error("Error converting the Excel file.", e);
          throw new DataSourceIngestionException(INGESTION_FILE_EXCEL_CONVERSION_ERROR, "Error converting the Excel file", e);
        }
      }
    }

  }

  @Override
  public void loadToEngine() {
    loadFileToEngine(Lists.newArrayList(srcFilePath), Lists.newArrayList(loadFileName));
  }

  @Override
  public void buildSpec() {
    IngestionSpec spec = new IngestionSpecBuilder()
        .dataSchema(dataSource)
        .batchTuningConfig(ingestionOptionService.findTuningOptionMap(IngestionOption.IngestionType.BATCH,
                                                                      localFileInfo.getTuningOptions()))
        .localIoConfig(engineProperties.getIngestion().getBaseDir(), loadFileName)
        .build();

    indexSpec = new BatchIndex(spec, dedicatedWorker);
  }

  @Override
  public String process() {
    String taskId = doIngestion(indexSpec);
    LOGGER.info("Successfully creating task : {}", ingestionHistory);
    return taskId;
  }

  private String createDestFileName(String dataSourceName, FileFormat fileFormat) {
    StringBuilder sb = new StringBuilder();
    sb.append(dataSourceName).append("_")
      .append(System.currentTimeMillis()).append(".");

    if(fileFormat instanceof CsvFileFormat
        || fileFormat instanceof ExcelFileFormat) {
      sb.append("csv");
    } else if(fileFormat instanceof JsonFileFormat) {
      sb.append("json");
    } else {
      throw new IllegalArgumentException("Not supported file type.");
    }

    return sb.toString();
  }
}


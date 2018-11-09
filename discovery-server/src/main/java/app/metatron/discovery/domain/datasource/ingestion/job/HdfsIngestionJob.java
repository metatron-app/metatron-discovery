package app.metatron.discovery.domain.datasource.ingestion.job;

import org.apache.commons.collections.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.ingestion.HdfsIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionOption;
import app.metatron.discovery.spec.druid.ingestion.HadoopIndex;
import app.metatron.discovery.spec.druid.ingestion.Index;
import app.metatron.discovery.spec.druid.ingestion.IngestionSpec;
import app.metatron.discovery.spec.druid.ingestion.IngestionSpecBuilder;

public class HdfsIngestionJob extends AbstractIngestionJob implements IngestionJob {

  private static final Logger LOGGER = LoggerFactory.getLogger(HdfsIngestionJob.class);

  private HdfsIngestionInfo ingestionInfo;

  private Index indexSpec;

  public HdfsIngestionJob(DataSource dataSource, IngestionHistory ingestionHistory) {
    super(dataSource, ingestionHistory);
    ingestionInfo = dataSource.getIngestionInfoByType();
  }

  @Override
  public void preparation() {
    return;
  }

  @Override
  public void loadToEngine() {
    return;
  }

  @Override
  public void buildSpec() {

    // Tuning config 외 타 Spec 에서 사용할수 있는 옵션 지정
    // Map Job 내에서 한번에 처리할수 있는 데이터 사이즈 지정 (Hive 인 경우 table directory size)
    String mapSplitSize = null;
    if (MapUtils.isNotEmpty(ingestionInfo.getTuningOptions())) {
      mapSplitSize = (String) ingestionInfo.getTuningOptions().get("mapSplitSize");
    }

    Map<String,Object> tuningOptions = ingestionOptionService.findTuningOptionMap(IngestionOption.IngestionType.HADOOP,
                                                                                  ingestionInfo.getTuningOptions());
    Map<String,Object> jobProperties = ingestionOptionService.findJobOptionMap(IngestionOption.IngestionType.HADOOP,
                                                                               ingestionInfo.getJobProperties());

    // Ingestion Task 생성
    IngestionSpec spec = new IngestionSpecBuilder()
        .dataSchema(dataSource)
        .hdfsIoConfig(ingestionInfo.getPaths(), ingestionInfo.isFindRecursive(), mapSplitSize)
        .hdfsTuningConfig(tuningOptions, jobProperties)
        .build();

    indexSpec = new HadoopIndex(spec);
  }

  @Override
  public String process() {
    String taskId = doIngestion(indexSpec);
    LOGGER.info("Successfully creating task : {}", ingestionHistory);
    return taskId;
  }

}


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

import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_HADOOP_NOT_CONFIGURED;
import static app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey.MSG_DP_ALERT_STAGING_BASE_DIR_NOT_CONFIGURED;
import static app.metatron.discovery.domain.dataprep.util.PrepUtil.configError;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import javax.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "polaris.dataprep")
public class PrepProperties {

  public static final String LOCAL_BASE_DIR = "polaris.dataprep.localBaseDir";
  public static final String HADOOP_CONF_DIR = "polaris.dataprep.hadoopConfDir";
  public static final String STAGING_BASE_DIR = "polaris.dataprep.stagingBaseDir";
  public static final String S3_BASE_DIR = "polaris.dataprep.s3BaseDir";

  public static final String SAMPLING_CORES = "polaris.dataprep.sampling.cores";
  public static final String SAMPLING_TIMEOUT = "polaris.dataprep.sampling.timeout";
  public static final String SAMPLING_LIMIT_ROWS = "polaris.dataprep.sampling.limitRows";
  public static final String SAMPLING_MAX_FETCH_SIZE = "polaris.dataprep.sampling.maxFetchSize";
  public static final String SAMPLING_AUTO_TYPING = "polaris.dataprep.sampling.autoTyping";

  public static final String STAGEDB_HOSTNAME = "polaris.storage.stagedb.hostname";
  public static final String STAGEDB_PORT = "polaris.storage.stagedb.port";
  public static final String STAGEDB_USERNAME = "polaris.storage.stagedb.username";
  public static final String STAGEDB_PASSWORD = "polaris.storage.stagedb.password";
  public static final String STAGEDB_METASTORE_URI = "polaris.storage.stagedb.metastore.uri";

  public static final String ETL_CORES = "polaris.dataprep.etl.cores";
  public static final String ETL_TIMEOUT = "polaris.dataprep.etl.timeout";
  public static final String ETL_LIMIT_ROWS = "polaris.dataprep.etl.limitRows";
  public static final String ETL_MAX_FETCH_SIZE = "polaris.dataprep.etl.maxFetchSize";
  public static final String ETL_JVM_OPTIONS = "polaris.dataprep.etl.jvmOptions";
  public static final String ETL_EXPLICIT_GC = "polaris.dataprep.etl.explicitGC";

  public static final String ETL_SPARK_JAR = "polaris.dataprep.etl.spark.jar";
  public static final String ETL_SPARK_PORT = "polaris.dataprep.etl.spark.port";
  public static final String ETL_SPARK_APP_NAME = "polaris.dataprep.etl.spark.appName";
  public static final String ETL_SPARK_MASTER = "polaris.dataprep.etl.spark.master";
  public static final String ETL_SPARK_WAREHOUSE_DIR = "polaris.dataprep.etl.spark.warehouseDir";

  public static String dirDataprep = "dataprep";
  public static String dirPreview = "previews";
  public static String dirUpload = "uploads";
  public static String dirSnapshot = "snapshots";

  public String localBaseDir;
  public String stagingBaseDir;
  public String s3BaseDir;
  public String hadoopConfDir;
  public SamplingInfo sampling;
  public EtlInfo etl;

  // Commonly, only below getters will be used

  public String getLocalBaseDir() {
    if (localBaseDir == null) {
      localBaseDir = System.getProperty("user.home") + File.separator + dirDataprep;
    }
    return localBaseDir;
  }

  public String getHadoopConfDir(boolean mandatory) {
    if (mandatory && hadoopConfDir == null) {
      throw configError(MSG_DP_ALERT_HADOOP_NOT_CONFIGURED, "Hadoop not configured");
    }
    return hadoopConfDir;
  }

  public String getStagingBaseDir(boolean mandatory) {
    if (mandatory && stagingBaseDir == null) {
      throw configError(MSG_DP_ALERT_STAGING_BASE_DIR_NOT_CONFIGURED, "StagingBaseDir not configured");
    }
    return stagingBaseDir;
  }

  public String getS3BaseDir(boolean mandatory) {
    if (mandatory && s3BaseDir == null) {
      throw configError(MSG_DP_ALERT_STAGING_BASE_DIR_NOT_CONFIGURED, "S3Dir not configured");
    }
    return s3BaseDir;
  }

  // sampling, etl cannot be null (see init())
  public Integer getSamplingCores() {
    return sampling.getCores();
  }

  public Integer getSamplingTimeout() {
    return sampling.getTimeout();
  }

  public Integer getSamplingLimitRows() {
    return sampling.getLimitRows();
  }

  public Integer getSamplingMaxFetchSize() {
    return sampling.getMaxFetchSize();
  }

  public Boolean getSamplingAutoTyping() {
    return sampling.getAutoTyping();
  }

  public Integer getEtlCores() {
    return etl.getCores();
  }

  public Integer getEtlTimeout() {
    return etl.getTimeout();
  }

  public Integer getEtlLimitRows() {
    return etl.getLimitRows();
  }

  public Integer getEtlMaxFetchSize() {
    return etl.getMaxFetchSize();
  }

  public String getEtlJvmOptions() {
    return etl.getJvmOptions();
  }

  public Boolean getEtlExplicitGC() {
    return etl.getExplicitGC();
  }

  public String getEtlSparkJar() {
    return etl.spark.getJar();
  }

  public String getEtlSparkPort() {
    return etl.spark.getPort();
  }

  public String getEtlSparkAppName() {
    return etl.spark.getAppName();
  }

  public String getEtlSparkMaster() {
    return etl.spark.getMaster();
  }

  public String getEtlSparkWarehouseDir() {
    return etl.spark.getWarehouseDir();
  }

  // wrapper functions
  public boolean isHDFSConfigured() {
    return (hadoopConfDir != null && stagingBaseDir != null);
  }

  public boolean isFileSnapshotEnabled() {
    return (true);
  } // always true

  public boolean isAutoTypingEnabled() {
    return sampling.getAutoTyping();
  }

  public boolean isSparkEngineEnabled() {
    return etl.spark.port != null;
  }

  // Everything for ETL
  public Map<String, Object> getEveryForEtl() {
    Map<String, Object> map = new HashMap();

    map.put(HADOOP_CONF_DIR, getHadoopConfDir(false));

    map.put(ETL_CORES, getEtlCores());
    map.put(ETL_TIMEOUT, getEtlTimeout());
    map.put(ETL_LIMIT_ROWS, getEtlLimitRows());
    map.put(ETL_MAX_FETCH_SIZE, getEtlMaxFetchSize());
    map.put(ETL_JVM_OPTIONS, getEtlJvmOptions());
    map.put(ETL_EXPLICIT_GC, getEtlExplicitGC());
    map.put(ETL_SPARK_PORT, getEtlSparkPort());
    map.put(ETL_SPARK_APP_NAME, getEtlSparkAppName());
    map.put(ETL_SPARK_MASTER, getEtlSparkMaster());
    map.put(ETL_SPARK_WAREHOUSE_DIR, getEtlSparkWarehouseDir());

    return map;
  }

  // Belows might be used only in this class

  @PostConstruct
  public void init() {
    if (sampling == null) {
      sampling = new SamplingInfo();
    }

    if (etl == null) {
      etl = new EtlInfo();
    }
  }

  public static class SamplingInfo {

    public Integer cores;
    public Integer timeout;
    public Integer limitRows;
    public Integer maxFetchSize;
    public Boolean autoTyping;

    public SamplingInfo() {
    }

    public Integer getCores() {
      if (cores == null) {
        cores = 1;
      }
      return cores;
    }

    public Integer getTimeout() {
      if (timeout == null) {
        timeout = 20;   // in seconds
      }
      return timeout;
    }

    public Integer getLimitRows() {
      if (limitRows == null) {
        limitRows = 10000;
      }
      return limitRows;
    }

    public Integer getMaxFetchSize() {
      if (maxFetchSize == null) {
        maxFetchSize = 1000;
      }
      return maxFetchSize;
    }

    public boolean getAutoTyping() {
      if (autoTyping == null) {
        autoTyping = true;
      }
      return autoTyping;
    }

    public void setCores(Integer cores) {
      this.cores = cores;
    }

    public void setTimeout(Integer timeout) {
      this.timeout = timeout;
    }

    public void setLimitRows(Integer limitRows) {
      this.limitRows = limitRows;
    }

    public void setMaxFetchSize(Integer maxFetchSize) {
      this.maxFetchSize = maxFetchSize;
    }

    public void setAutoTyping(Boolean autoTyping) {
      this.autoTyping = autoTyping;
    }

    @Override
    public String toString() {
      return String.format("SamplingInfo{cores=%d timeout=%d limitRows=%d maxFetchSize=%d autoTyping=%b}",
              cores, timeout, limitRows, maxFetchSize, autoTyping);
    }
  }

  public static class SparkInfo {

    public String jar;
    public String port;
    public String appName;
    public String master;
    public String warehouseDir;

    public SparkInfo() {
    }

    public String getJar() {
      return jar;
    }

    public void setJar(String jar) {
      this.jar = jar;
    }

    public String getPort() {
      return port;
    }

    public void setPort(String port) {
      this.port = port;
    }

    public String getAppName() {
      if (appName == null) {
        appName = "DiscoverySparkEngine";
      }
      return appName;
    }

    public void setAppName(String appName) {
      this.appName = appName;
    }

    public String getMaster() {
      if (master == null) {
        master = "local";
      }
      return master;
    }

    public void setMaster(String master) {
      this.master = master;
    }

    public String getWarehouseDir() {
      if (warehouseDir == null) {
        warehouseDir = "file:///tmp";
      }
      return warehouseDir;
    }

    public void setWarehouseDir(String warehouseDir) {
      this.warehouseDir = warehouseDir;
    }

    @Override
    public String toString() {
      return "SparkInfo{" +
              "jar='" + jar + '\'' +
              ", port='" + port + '\'' +
              ", appName='" + appName + '\'' +
              ", master='" + master + '\'' +
              ", warehouseDir='" + warehouseDir + '\'' +
              '}';
    }
  }

  public static class EtlInfo {

    public Integer cores;
    public Integer timeout;
    public Integer limitRows;
    public Integer maxFetchSize;
    public String jvmOptions;
    public Boolean explicitGC;
    public SparkInfo spark;

    public EtlInfo() {
      if (spark == null) {
        spark = new SparkInfo();
      }
    }

    public Integer getCores() {
      if (cores == null) {
        cores = 1;
      }
      return cores;
    }

    public Integer getTimeout() {
      if (timeout == null) {
        timeout = 3600 * 24;  // in seconds
      }
      return timeout;
    }

    public Integer getLimitRows() {
      if (limitRows == null) {
        limitRows = 100 * 10000;  // being conservative
      }
      return limitRows;
    }

    public Integer getMaxFetchSize() {
      if (maxFetchSize == null) {
        maxFetchSize = 1000;
      }
      return maxFetchSize;
    }

    public String getJvmOptions() {
      if (jvmOptions == null) {
        jvmOptions = "-Xmx1g";
      }
      return jvmOptions;
    }

    public Boolean getExplicitGC() {
      if (explicitGC == null) {
        explicitGC = false;
      }
      return explicitGC;
    }

    public SparkInfo getSpark() {
      return spark;
    }

    public void setCores(Integer cores) {
      this.cores = cores;
    }

    public void setTimeout(Integer timeout) {
      this.timeout = timeout;
    }

    public void setLimitRows(Integer limitRows) {
      this.limitRows = limitRows;
    }

    public void setMaxFetchSize(Integer maxFetchSize) {
      this.maxFetchSize = maxFetchSize;
    }

    public void setJvmOptions(String jvmOptions) {
      this.jvmOptions = jvmOptions;
    }

    public void setExplicitGC(Boolean explicitGC) {
      this.explicitGC = explicitGC;
    }

    public void setSpark(SparkInfo spark) {
      this.spark = spark;
    }

    @Override
    public String toString() {
      return String.format("EtlInfo{cores=%d timeout=%d limitRows=%d maxFetchSize=%d jvmOptions=%s explicitGC=%b}",
              cores, timeout, limitRows, maxFetchSize, jvmOptions, explicitGC);
    }
  }

  public void setLocalBaseDir(String localBaseDir) {
    if (localBaseDir != null && localBaseDir.length() > 1 && localBaseDir.endsWith(File.separator)) {
      this.localBaseDir = localBaseDir.substring(0, localBaseDir.length());
    } else {
      this.localBaseDir = localBaseDir;
    }
  }

  public void setStagingBaseDir(String stagingBaseDir) {
    if (stagingBaseDir != null && stagingBaseDir.length() > 1 && stagingBaseDir.endsWith(File.separator)) {
      this.stagingBaseDir = stagingBaseDir.substring(0, stagingBaseDir.length());
    } else {
      this.stagingBaseDir = stagingBaseDir;
    }
  }

  public void setS3BaseDir(String s3BaseDir) {
    if (s3BaseDir != null && s3BaseDir.length() > 1 && s3BaseDir.endsWith(File.separator)) {
      this.s3BaseDir = s3BaseDir.substring(0, s3BaseDir.length());
    } else {
      this.s3BaseDir = s3BaseDir;
    }
  }

  public String getStagingBaseDir() {
    return stagingBaseDir;
  }

  public String getS3BaseDir() {
    return s3BaseDir;
  }

  public String getHadoopConfDir() {
    return hadoopConfDir;
  }

  public SamplingInfo getSampling() {
    return sampling;
  }

  public EtlInfo getEtl() {
    return etl;
  }

  public static void setDirDataprep(String dirDataprep) {
    PrepProperties.dirDataprep = dirDataprep;
  }

  public static void setDirPreview(String dirPreview) {
    PrepProperties.dirPreview = dirPreview;
  }

  public static void setDirUpload(String dirUpload) {
    PrepProperties.dirUpload = dirUpload;
  }

  public static void setDirSnapshot(String dirSnapshot) {
    PrepProperties.dirSnapshot = dirSnapshot;
  }

  public void setHadoopConfDir(String hadoopConfDir) {
    this.hadoopConfDir = hadoopConfDir;
  }

  public void setSampling(SamplingInfo sampling) {
    this.sampling = sampling;
  }

  public void setEtl(EtlInfo etl) {
    this.etl = etl;
  }

  @Override
  public String toString() {
    return String.format(
            "PrepProperties{localBaseDir=%s stagingBaseDir=%s s3BaseDir=%s hadoopConfDir=%s sampling=%s etl=%s}",
            localBaseDir, stagingBaseDir, s3BaseDir, hadoopConfDir, sampling, etl);
  }
}

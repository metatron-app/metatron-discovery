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
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.File;

@Component
@ConfigurationProperties(prefix="polaris.dataprep")
public class PrepProperties {
  public static final String LOCAL_BASE_DIR       = "polaris.dataprep.localBaseDir";
  public static final String STAGING_BASE_DIR     = "polaris.dataprep.stagingBaseDir";
  public static final String HADOOP_CONF_DIR      = "polaris.dataprep.hadoopConfDir";

  public static final String HIVE_HOSTNAME        = "polaris.dataprep.hive.hostname";
  public static final String HIVE_PORT            = "polaris.dataprep.hive.port";
  public static final String HIVE_USERNAME        = "polaris.dataprep.hive.username";
  public static final String HIVE_PASSWORD        = "polaris.dataprep.hive.password";
  public static final String HIVE_CUSTOM_URL      = "polaris.dataprep.hive.customUrl";
  public static final String HIVE_METASTORE_URIS  = "polaris.dataprep.hive.metastoreUris";

  public static final String SAMPLING_CORES       = "polaris.dataprep.sampling.cores";
  public static final String SAMPLING_TIMEOUT     = "polaris.dataprep.sampling.timeout";
  public static final String SAMPLING_LIMIT_ROWS  = "polaris.dataprep.sampling.limitRows";
  public static final String SAMPLING_AUTO_TYPING = "polaris.dataprep.sampling.autoTyping";

  public static final String ETL_CORES            = "polaris.dataprep.etl.cores";
  public static final String ETL_TIMEOUT          = "polaris.dataprep.etl.timeout";
  public static final String ETL_LIMIT_ROWS       = "polaris.dataprep.etl.limitRows";
  public static final String ETL_JAR              = "polaris.dataprep.etl.jar";
  public static final String ETL_JVM_OPTIONS      = "polaris.dataprep.etl.jvmOptions";

  public String localBaseDir;
  public String stagingBaseDir;
  public String hadoopConfDir;
  public HiveInfo hive;
  public SamplingInfo sampling;
  public EtlInfo etl;

  public static class HiveInfo {
    public String hostname;
    public Integer port;
    public String username;
    public String password;
    public String customUrl;
    public String metastoreUris;

    public HiveInfo() {
    }

    public String getHostname() {
      if (hostname == null) {
        hostname = "localhost";
      }
      return hostname;
    }

    public Integer getPort() {
      if (port == null) {
        port = 10000;
      }
      return port;
    }

    public String getUsername() {
      if (username == null) {
        username = "hadoop";
      }
      return username;
    }

    public String getPassword() {
      if (password == null) {
        password = "hadoop";
      }
      return password;
    }

    public String getCustomUrl() {
      return customUrl;
    }

    public String getMetastoreUris() {
      if (metastoreUris == null) {
        metastoreUris = "thrift://" + getHostname() + ":9083";
      }
      return metastoreUris;
    }

    public void setHostname(String hostname) {
      this.hostname = hostname;
    }

    public void setPort(Integer port) {
      this.port = port;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public void setPassword(String password) {
      this.password = password;
    }

    public void setCustomUrl(String customUrl) {
      this.customUrl = customUrl;
    }

    public void setMetastoreUris(String metastoreUris) {
      this.metastoreUris = metastoreUris;
    }

    @Override
    public String toString() {
      return String.format("HiveInfo{hostname=%s port=%d username=%s password=%s customUrl=%s metastoreUris=%s}",
                                     hostname, port, username, password, customUrl, metastoreUris);
    }
  }

  public static class SamplingInfo {
    public Integer cores;
    public Integer timeout;
    public Integer limitRows;
    public Boolean autoTyping;

    public SamplingInfo() {
    }

    public Integer getCores() {
      if (cores == null) {
        cores = 0;
      }
      return cores;
    }

    public Integer getTimeout() {
      if (timeout == null) {
        timeout = 10;   // in seconds
      }
      return timeout;
    }

    public Integer getRows() {
      if (limitRows == null) {
        limitRows = 10000;
      }
      return limitRows;
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

    public void setAutoTyping(Boolean autoTyping) {
      this.autoTyping = autoTyping;
    }

    @Override
    public String toString() {
      return String.format("SamplingInfo{cores=%d timeout=%d limitRows=%d autoTyping=%b}",
                                         cores, timeout, limitRows, autoTyping);
    }
  }

  public static class EtlInfo {
    public Integer cores;
    public Integer timeout;
    public Integer limitRows;
    public String jar;
    public String jvmOptions;

    public EtlInfo() {
    }

    public Integer getCores() {
      if (cores == null) {
        cores = 0;
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

    public String getJar() {
      if (jar == null) {
        throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE,
                PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, ETL_JAR);
      }
      return jar;
    }

    public String getJvmOptions() {
      if (jvmOptions == null) {
        jvmOptions = "-Xmx1g";
      }
      return jvmOptions;
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

    public void setJar(String jar) {
      this.jar = jar;
    }

    public void setJvmOptions(String jvmOptions) {
      this.jvmOptions = jvmOptions;
    }

    @Override
    public String toString() {
      return String.format("EtlInfo{cores=%d timeout=%d jar=%s jvmOptions=%s}",
                                    cores, timeout, jar, jvmOptions);
    }
  }

  @PostConstruct
  public void init() {
    if (sampling == null) {
      sampling = new SamplingInfo();
    }

    if (etl == null) {
      etl = new EtlInfo();
    }
  }

  public String getLocalBaseDir() {
    if (localBaseDir == null) {
      localBaseDir = System.getProperty("user.home") + File.separator + "dataprep";
    }
    return localBaseDir;
  }

  public String getStagingBaseDir() {
    if (stagingBaseDir == null) {
      throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE,
              PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, STAGING_BASE_DIR);
    }
    return stagingBaseDir;
  }

  public String getHadoopConfDir() {
    if (hadoopConfDir == null) {
      throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE,
              PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
    }
    return hadoopConfDir;
  }

  public HiveInfo getHive() {
    return hive;
  }

  public SamplingInfo getSampling() {
    return sampling;
  }

  public EtlInfo getEtl() {
    return etl;
  }

  public void setLocalBaseDir(String localBaseDir) {
    this.localBaseDir = localBaseDir;
  }

  public void setStagingBaseDir(String stagingBaseDir) {
    this.stagingBaseDir = stagingBaseDir;
  }

  public void setHadoopConfDir(String hadoopConfDir) {
    this.hadoopConfDir = hadoopConfDir;
  }

  public void setHive(HiveInfo hive) {
    this.hive = hive;
  }

  public void setSampling(SamplingInfo sampling) {
    this.sampling = sampling;
  }

  public void setEtl(EtlInfo etl) {
    this.etl = etl;
  }

  @Override
  public String toString() {
    return String.format("PrepProperties{localBaseDir=%s stagingBaseDir=%s hadoopConfDir=%s hive=%s sampling=%s etl=%s}",
                                         localBaseDir, stagingBaseDir, hadoopConfDir, hive, sampling, etl);
  }

  // wrapper functions
  public boolean isHDFSConfigured() {
    return (hadoopConfDir != null && stagingBaseDir != null);
  }

  public boolean isHiveSnapshotEnabled() {
    return (isHDFSConfigured() && hive != null);
  }

  public boolean isAutoTyping() {
    return sampling.getAutoTyping();
  }
}

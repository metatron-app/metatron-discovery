package app.metatron.discovery.domain.dataprep.util;

import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.HIVE_FILE_COMPRESSION;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot.HIVE_FILE_FORMAT;
import java.io.File;
import java.util.Map;

public class HiveInfo {

  public HIVE_FILE_FORMAT format;
  public HIVE_FILE_COMPRESSION compression;
  public String extHdfsDir;
  public String dbName;
  public String tblName;

  public HiveInfo() {
  }

  public HiveInfo(Map<String, Object> snapshotInfo) {
    String strHiveFileFormat = (String) snapshotInfo.get("hiveFileFormat");
    String strHiveFileCompression = (String) snapshotInfo.get("hiveFileCompression");
    String dbName = (String) snapshotInfo.get("dbName");
    String tblName = (String) snapshotInfo.get("tblName");
    String extHdfsDir = snapshotInfo.get("stagingBaseDir") + File.separator + "snapshots";

    HIVE_FILE_FORMAT format = HIVE_FILE_FORMAT.valueOf(strHiveFileFormat);
    HIVE_FILE_COMPRESSION compression = HIVE_FILE_COMPRESSION.valueOf(strHiveFileCompression);

    this.format = format;
    this.compression = compression;
    this.extHdfsDir = extHdfsDir;
    this.dbName = dbName;
    this.tblName = tblName;
  }

  @Override
  public String toString() {
    return "HiveInfo{" +
            "format=" + format +
            ", compression=" + compression +
            ", extHdfsDir='" + extHdfsDir + '\'' +
            ", dbName='" + dbName + '\'' +
            ", tblName='" + tblName + '\'' +
            '}';
  }
}

package app.metatron.discovery.domain.workbench;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.security.UserGroupInformation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import scala.Array;

import java.io.IOException;
import java.io.OutputStream;
import java.security.PrivilegedExceptionAction;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class QueryResultRepositoryHdfsImpl implements QueryResultRepository {
  private static final String DEFAULT_HDFS_BASE_PATH = "/tmp/metatron";

  private String hdfsBasePath;

  @Value("${polaris.workbench.query.result.store.hdfs.basepath}")
  public void setHdfsBasePath(String hdfsBasePath) {
    this.hdfsBasePath = hdfsBasePath;
  }

  @Override
  public void save(JdbcDataConnection jdbcDataConnection, String metatronUserId, String queryEditorId, QueryResult queryResult) {
    if(jdbcDataConnection instanceof HiveConnection
        && ((HiveConnection) jdbcDataConnection).isSupportSaveAsHive()) {
      HiveConnection hiveConnection = (HiveConnection)jdbcDataConnection;
      final String hiveAdminUser = hiveConnection.getSecondaryUsername();

      FileSystem fs = null;
      try {
        fs = getFileSystem(hiveConnection.getHdfsConfigurationPath(), hiveAdminUser);

        Path metatronUserHomePath = makeUserHomePath(metatronUserId);
        Path queryResultPath = makeQueryResultPath(metatronUserHomePath, queryEditorId);

        if (!fs.exists(queryResultPath)) {
          try {
            fs.mkdirs(queryResultPath);
          } catch(IOException e) {
            String errorMessage = String.format("failed make user query result directory to HDFS : %s", queryResultPath.toString());
            throw new MetatronException(errorMessage, e);
          }
        }

        Path headerFilePath = makeQueryResultFilePath(queryResultPath, queryResult.getAuditId(), StoreFileType.HEADER);
        List<String> fields = queryResult.getFields().stream().map(field -> field.getName()).collect(Collectors.toList());
        try(OutputStream out = fs.create(headerFilePath)) {
         out.write(GlobalObjectMapper.getDefaultMapper().writeValueAsString(fields).getBytes());
        } catch(Exception e) {
          String errorMessage = String.format("failed write file to HDFS : %s", headerFilePath.toString());
          throw new MetatronException(errorMessage, e);
        }

        Path dataFilePath = makeQueryResultFilePath(queryResultPath, queryResult.getAuditId(), StoreFileType.DATA);
        try(OutputStream out = fs.create(dataFilePath)) {
          for (Map<String, Object> row : queryResult.getData()) {
            out.write((
                String.join("\001",
                    row.values().stream()
                        .map(value -> String.valueOf(value))
                        .collect(Collectors.toList())) + "\n").getBytes());
          }
        } catch(Exception e) {
          String errorMessage = String.format("failed write file to HDFS : %s", dataFilePath.toString());
          throw new MetatronException(errorMessage, e);
        }
      } catch (Exception e) {
        String errorMessage = "failed write file to HDFS";
        throw new MetatronException(errorMessage, e);
      } finally {
        if(fs != null) {
          try {
            fs.close();
          } catch (IOException e) {
            e.printStackTrace();
          }
        }
      }
    }
  }

  @Override
  public void delete(JdbcDataConnection jdbcDataConnection, String metatronUserId, String queryEditorId) {
    if(jdbcDataConnection instanceof HiveConnection
        && ((HiveConnection) jdbcDataConnection).isSupportSaveAsHive()) {
      HiveConnection hiveConnection = (HiveConnection)jdbcDataConnection;
      final String hiveAdminUser = hiveConnection.getSecondaryUsername();

      FileSystem fs = null;
      try {
        fs = getFileSystem(hiveConnection.getHdfsConfigurationPath(), hiveAdminUser);

        Path queryResultPath = makeQueryResultPath(makeUserHomePath(metatronUserId), queryEditorId);
        if(queryResultPath.toString().startsWith("/tmp")) {
          if(fs.exists(queryResultPath)) {
            fs.delete(queryResultPath, true);
          }
        } else {
          throw new MetatronException(
              String.format("failed delete query result directory(%s) - Deleting directory must start with tmp",
                  queryResultPath.toString()));
        }
      } catch (Exception e) {
        throw new MetatronException("failed delete query result directory", e);
      } finally {
        if(fs != null) {
          try {
            fs.close();
          } catch (IOException e) {
            e.printStackTrace();
          }
        }
      }
    }
  }

  @Override
  public QueryResultMetaData findMetaData(JdbcDataConnection jdbcDataConnection, String metatronUserId, String queryEditorId, String auditId) {
    if(jdbcDataConnection instanceof HiveConnection
        && ((HiveConnection) jdbcDataConnection).isSupportSaveAsHive()) {
      HiveConnection hiveConnection = (HiveConnection)jdbcDataConnection;
      final String hiveAdminUser = hiveConnection.getSecondaryUsername();
      FileSystem fs = null;
      try {
        fs = getFileSystem(hiveConnection.getHdfsConfigurationPath(), hiveAdminUser);

        Path headerFilePath = makeQueryResultFilePath(
            makeQueryResultPath(makeUserHomePath(metatronUserId), queryEditorId), auditId, StoreFileType.HEADER);
        Path dataFilePath = makeQueryResultFilePath(
            makeQueryResultPath(makeUserHomePath(metatronUserId), queryEditorId), auditId, StoreFileType.DATA);

        if(fs.exists(headerFilePath) && fs.exists(dataFilePath)) {
          try(FSDataInputStream in = fs.open(headerFilePath)) {
            byte[] bs = new byte[in.available()];
            in.read(bs);

            List<String> headers = GlobalObjectMapper.readListValue(new String(bs), String.class);
            return new QueryResultMetaData(headers, dataFilePath.toString());
          } catch(Exception e){
            throw new MetatronException(
                String.format("Failed find query result metadata", e));
          }
        } else {
          throw new MetatronException(
              String.format("Not found query result file : %s, %s", headerFilePath.toString(), dataFilePath.toString()));
        }
      } catch (Exception e) {
        throw new MetatronException(
            String.format("Failed find query result metadata", e));
      } finally {
        if(fs != null) {
          try {
            fs.close();
          } catch (IOException e) {
            e.printStackTrace();
          }
        }
      }
    } else {
      return new QueryResultMetaData(Collections.emptyList(), "");
    }
  }

  private Path makeQueryResultFilePath(Path queryResultPath, String auditId, StoreFileType fileType) {
    if(fileType == StoreFileType.HEADER) {
      return new Path(queryResultPath, String.format("%s.json", auditId));
    } else {
      return new Path(queryResultPath, String.format("%s.dat", auditId));
    }
  }

  private Path makeQueryResultPath(Path metatronUserHomePath, String queryEditorId) {
    return new Path(metatronUserHomePath, String.format("%s/", queryEditorId));
  }

  private Path makeUserHomePath(String metatronUserId) {
    return new Path(String.format("%s/%s/", StringUtils.defaultString(hdfsBasePath, DEFAULT_HDFS_BASE_PATH), metatronUserId));
  }

  private FileSystem getFileSystem(String hdfsConfigurationPath, String remoteUser) throws IOException, InterruptedException {
    final Configuration conf = getHdfsConfiguration(hdfsConfigurationPath);
    UserGroupInformation ugi = UserGroupInformation.createRemoteUser(remoteUser);
    return ugi.doAs((PrivilegedExceptionAction<FileSystem>) () -> FileSystem.get(conf));
  }

  private Configuration getHdfsConfiguration(String hdfsConfigurationPath) {
    final Configuration conf = new Configuration();
    conf.addResource(new Path(String.format("%s/core-site.xml", hdfsConfigurationPath)));
    conf.addResource(new Path(String.format("%s/hdfs-site.xml", hdfsConfigurationPath)));

    return conf;
  }

  private enum StoreFileType {
    HEADER, DATA
  }

}

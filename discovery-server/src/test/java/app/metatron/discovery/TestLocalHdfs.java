package app.metatron.discovery;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.security.UserGroupInformation;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Paths;
import java.security.PrivilegedExceptionAction;

public class TestLocalHdfs {
  final static String localHdfsSuperUser = "yooyoungmo";
  final Configuration configuration;

  public TestLocalHdfs() {
    String hdfsConfLocalPath = Paths.get("src/test/hdfs-conf").toAbsolutePath().toString();

    Configuration conf = new Configuration();
    conf.addResource(new Path(String.format("%s/core-site.xml", hdfsConfLocalPath)));
    conf.addResource(new Path(String.format("%s/hdfs-site.xml", hdfsConfLocalPath)));
    this.configuration = conf;
  }

  public TestLocalHdfs(Configuration configuration) {
    this.configuration = configuration;
  }

  public void delete(Path path) throws IOException, InterruptedException {
    FileSystem fs = null;
    try {
      UserGroupInformation ugi = UserGroupInformation.createRemoteUser(localHdfsSuperUser);
      fs = ugi.doAs((PrivilegedExceptionAction<FileSystem>) () -> FileSystem.get(this.configuration));

      // 이전 Fixture 삭제
      if(fs.exists(path)) {
        fs.delete(path, true);
      }
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

  public boolean exists(Path path) throws IOException, InterruptedException {
    FileSystem fs = null;
    try {
      UserGroupInformation ugi = UserGroupInformation.createRemoteUser(localHdfsSuperUser);
      fs = ugi.doAs((PrivilegedExceptionAction<FileSystem>) () -> FileSystem.get(this.configuration));

      if(fs.exists(path)) {
        return true;
      } else {
        return false;
      }
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

  public void writeFile(String hdfsUser, Path path, String fileName, String fileContents) throws IOException, InterruptedException {
    FileSystem fs = null;
    try {
      UserGroupInformation ugi = UserGroupInformation.createRemoteUser(hdfsUser);
      fs = ugi.doAs((PrivilegedExceptionAction<FileSystem>) () -> FileSystem.get(this.configuration));

      if (!fs.exists(path)) {
        fs.mkdirs(path);
      }

      try(OutputStream out = fs.create(new Path(path, fileName))) {
        out.write(fileContents.getBytes());
      }
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

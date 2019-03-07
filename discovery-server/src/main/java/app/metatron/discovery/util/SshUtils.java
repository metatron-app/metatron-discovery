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

package app.metatron.discovery.util;

import com.google.common.collect.Lists;

import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Properties;
import java.util.UUID;

/**
 * Created by kyungtaak on 2016. 7. 31..
 */
public class SshUtils {

  private static final Logger LOGGER = LoggerFactory.getLogger(SshUtils.class);

  private static Session getSSHSession(String hostname, String username, String password, int port) {

    JSch jsch = new JSch();
    Session session = null;
    try {
      session = jsch.getSession(username, hostname, port);

      if(StringUtils.isNotEmpty(password)) {
        if (password.indexOf("pem:") > -1) {
          String pemPath = StringUtils.substringAfter(password, "pem:");
          jsch.addIdentity(pemPath);
        } else {
          session.setPassword(password);
        }
      }

      Properties config = new Properties();
      config.put("StrictHostKeyChecking", "no");
      session.setConfig(config);
      session.connect();
    } catch (JSchException e) {
      LOGGER.error("Fail to connect server({}) bia SSH : {}", hostname, e.getMessage());
      throw new RuntimeException("Fail to connect server(" + hostname + ") bia SSH : " + e.getMessage());
    }

    return session;
  }

  public static void copyLocalToRemoteFileByScp(List<String> srcFileNames, String targetDir, String hostName, int port,
                                                String username, String password) {
    copyLocalToRemoteFileByScp(srcFileNames, null, targetDir, hostName, port, username, password, false);
  }

  public static void copyLocalToRemoteFileByScp(List<String> srcPaths, List<String> targetFileNames, String targetDir, String hostName, int port,
                                                String username, String password, boolean checkSrcPath) {

    FileInputStream fis = null;
    Session session = null;
    try {

      session = getSSHSession(hostName, username, password, port);

      boolean renameTargetFile = CollectionUtils.isNotEmpty(targetFileNames)
          && srcPaths.size() == targetFileNames.size();

      for(int i=0; i<srcPaths.size(); i++) {

        String srcPath = srcPaths.get(i);

        File srcFile = getFileFromPathString(srcPath);
        if (!srcFile.isFile()) {
          if(checkSrcPath) {
            throw new RuntimeException("No source file(" + srcPath + ") to copy via SSH.");
          } else {
            LOGGER.warn("No source file({}) to copy via SSH. This file is passed.", srcPath);
            continue;
          }
        }

        String targetFileName = renameTargetFile ? targetFileNames.get(i) : srcFile.getName();

        StringBuilder commandBuilder = new StringBuilder();
        commandBuilder.append("scp ");
        commandBuilder.append("-P ").append(port).append(" ");
        commandBuilder.append("-t ").append(targetDir).append("/").append(targetFileName);

        Channel channel = session.openChannel("exec");
        ((ChannelExec) channel).setCommand(commandBuilder.toString());

        // get I/O streams for remote scp
        OutputStream out = channel.getOutputStream();
        InputStream in = channel.getInputStream();

        channel.connect();

        if (checkAck(in) != 0) {
          LOGGER.error("SCP ack denied.");
          throw new RuntimeException("SCP ack denied.");
        }

        // send "C0644 filesize filename", where filename should not include '/'
        commandBuilder = new StringBuilder();
        commandBuilder.append("C0644 ").append(srcFile.length()).append(" ").append(targetFileName).append("\n");
        out.write(commandBuilder.toString().getBytes());
        out.flush();

        if (checkAck(in) != 0) {
          LOGGER.error("SCP ack denied.");
          throw new RuntimeException("SCP ack denied.");
        }

        // send a content of lfile
        fis = new FileInputStream(srcFile);
        byte[] buf = new byte[1024];
        while (true) {
          int len = fis.read(buf, 0, buf.length);
          if (len <= 0) break;
          out.write(buf, 0, len); //out.flush();
        }
        fis.close();
        fis = null;
        // send '\0'
        buf[0] = 0;
        out.write(buf, 0, 1);
        out.flush();

        if (checkAck(in) != 0) {
          LOGGER.error("SCP ack denied.");
          throw new RuntimeException("SCP ack denied.");
        }
        out.close();

        channel.disconnect();

        LOGGER.debug("Successfully copy file {} to {}:{}/{}", srcPath, hostName, targetDir, targetFileName);
      }

    } catch (Exception e) {
      LOGGER.error("Fail to copy file bia SSH : {}", e.getMessage());
      throw new RuntimeException("Fail to copy file bia SSH : " + e.getMessage());
    } finally {
      if (session != null) {
        session.disconnect();
      }
      try {
        if (fis != null) fis.close();
      } catch (Exception ee) {
      }
    }
  }

  public static List<String> copyRemoteToLocalFileByScp(List<String> srcFileNames, String targetDir, String hostName, int port,
                                                        String username, String password) {

    FileOutputStream fos = null;
    List<String> copiedFiles = Lists.newArrayList();
    Session session = null;
    try {

      session = getSSHSession(hostName, username, password, port);

      for (String path : srcFileNames) {

        String fileName = PolarisUtils.getFileName(path);

        StringBuilder commandBuilder = new StringBuilder();
        commandBuilder.append("scp ");
        commandBuilder.append("-P ").append(port).append(" ");
        commandBuilder.append("-f ").append(path);

        Channel channel = session.openChannel("exec");
        ((ChannelExec) channel).setCommand(commandBuilder.toString());

        // get I/O streams for remote scp
        OutputStream out = channel.getOutputStream();
        InputStream in = channel.getInputStream();

        String localFileName = targetDir + File.separator + fileName;

        channel.connect();

        byte[] buf = new byte[1024];

        // send '\0'
        buf[0] = 0;
        out.write(buf, 0, 1);
        out.flush();

        while (true) {
          int c = checkAck(in);
          if (c != 'C') {
            break;
          }

          // read '0644 '
          in.read(buf, 0, 5);

          long filesize = 0L;
          while (true) {
            if (in.read(buf, 0, 1) < 0) {
              // error
              break;
            }
            if (buf[0] == ' ') break;
            filesize = filesize * 10L + (long) (buf[0] - '0');
          }

          String file = null;
          for (int i = 0; ; i++) {
            in.read(buf, i, 1);
            if (buf[i] == (byte) 0x0a) {
              file = new String(buf, 0, i);
              break;
            }
          }

          //System.out.println("filesize="+filesize+", file="+file);

          // send '\0'
          buf[0] = 0;
          out.write(buf, 0, 1);
          out.flush();

          // read a content of lfile
          fos = new FileOutputStream(localFileName);
          int foo;
          while (true) {
            if (buf.length < filesize) foo = buf.length;
            else foo = (int) filesize;
            foo = in.read(buf, 0, foo);
            if (foo < 0) {
              // error
              break;
            }
            fos.write(buf, 0, foo);
            filesize -= foo;
            if (filesize == 0L) break;
          }
          fos.close();

          if (checkAck(in) != 0) {
            LOGGER.error("SCP ack denied.");
            throw new RuntimeException("SCP ack denied.");
          }

          // send '\0'
          buf[0] = 0;
          out.write(buf, 0, 1);
          out.flush();
        }

        channel.disconnect();
        copiedFiles.add(localFileName);
        LOGGER.debug("Successfully copy file from {} : {}", hostName, fileName);
      }
      session.disconnect();

    } catch (Exception e) {
      LOGGER.error("Fail to copy file : {}", e.getMessage());
      throw new RuntimeException("Fail to copy file : " + e.getMessage());
    } finally {
      if (session != null) {
        session.disconnect();
      }
      try {
        if (fos != null) fos.close();
      } catch (Exception ee) {
      }
    }

    return copiedFiles;
  }


  private static int checkAck(InputStream in) throws IOException {

    int b = in.read();
    // b may be 0 for success,
    //          1 for error,
    //          2 for fatal error,
    //          -1

    if (b == 0) {
      return b;
    }
    if (b == -1) {
      return b;
    }

    if (b == 1 || b == 2) {
      StringBuilder sb = new StringBuilder();
      int c;
      do {
        c = in.read();
        sb.append((char) c);
      }
      while (c != '\n');
      if (b == 1) { // error
        LOGGER.warn(sb.toString());
      }
      if (b == 2) { // fatal error
        LOGGER.warn(sb.toString());
      }
    }
    return b;
  }

  public static List<String> copyRemoteToLocalFileBySftp(List<String> srcFilePath, String targetDir, String hostName, int port,
                                                         String username, String password, boolean preserveFileName, boolean deleteRemoteFile) {

    InputStream is = null;
    FileOutputStream fos = null;
    List<String> copiedFiles = Lists.newArrayList();
    Session session = null;
    try {

      session = getSSHSession(hostName, username, password, port);

      Channel channel = session.openChannel("sftp");
      channel.connect();

      ChannelSftp channelSftp = (ChannelSftp) channel;


      for (String path : srcFilePath) {

        String fileName;
        if(preserveFileName) {
          fileName = PolarisUtils.getFileName(path);
        } else {
          fileName = "MFD-" + UUID.randomUUID().toString();
        }
        String localPath = targetDir + File.separator + fileName;

        is = channelSftp.get(path);
        fos = new FileOutputStream(new File(localPath));

        int readCount;
        byte[] buffer = new byte[1024];
        while( (readCount = is.read(buffer)) > 0) {
          fos.write(buffer, 0, readCount);
        }

        copiedFiles.add(localPath);
        LOGGER.info("Successfully copy file from {}:{} to {}", hostName, path, localPath);
      }

      if(deleteRemoteFile) {
        for (String path : srcFilePath) {
          channelSftp.rm(path);
          LOGGER.info("Successfully delete remote file : {}:{}", hostName, path);
        }
      }

      session.disconnect();

    } catch (Exception e) {
      LOGGER.error("Fail to copy file : {}", e.getMessage());
      throw new RuntimeException("Fail to copy file : " + e.getMessage());
    } finally {
      if (session != null) {
        session.disconnect();
      }
      try {
        if (fos != null) fos.close();
      } catch (Exception ee) {}
      try {
        if (is != null) is.close();
      } catch (Exception ee) {}
    }

    return copiedFiles;

  }
  public static File getFileFromPathString(String filePath){
    try {
      // First try to resolve as URL (file:...)
      Path path = Paths.get(new URL(filePath).toURI());
      FileSystemResource resource = new FileSystemResource(path.toFile());
      return resource.getFile();
    } catch (URISyntaxException | MalformedURLException e) {
      // If given file string isn't an URL, fall back to using a normal file
      return new FileSystemResource(filePath).getFile();
    }
  }
}

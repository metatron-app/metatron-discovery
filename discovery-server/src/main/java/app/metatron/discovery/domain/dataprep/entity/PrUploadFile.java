package app.metatron.discovery.domain.dataprep.entity;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonValue;
import org.apache.commons.io.FilenameUtils;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import javax.validation.constraints.Size;

@Entity
@Table(name = "pr_upload_file")
public class PrUploadFile extends AbstractHistoryEntity {

  @JsonFormat(shape = JsonFormat.Shape.OBJECT)
  public enum STORAGE_TYPE {
    LOCAL,
    HDFS,
    S3,
    BLOB,
    FTP;

    @JsonValue
    public String toJson() {
      return name();
    }
  }

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "upload_id")
  private String uploadId;

  @Size(max = 2000)
  @Column(name = "orig_filename")
  private String originalFilename;

  @Size(max = 2000)
  @Column(name = "local_uri")
  private String localUri;

  @Size(max = 2000)
  @Column(name = "file_uri")
  private String fileUri;

  @Column(name = "rest_chunk")
  Integer restChunk;

  @Column(name = "file_size")
  Long fileSize;

  @Column(name = "storage_type")
  STORAGE_TYPE storageType;

  public PrUploadFile() {
  }

  // getter property
  public String getFilename() {
    String filename = this.uploadId;

    String extensionType = FilenameUtils.getExtension(this.originalFilename);
    if(extensionType!=null && 0<extensionType.length()) {
      filename = filename + "." + extensionType.toLowerCase();
    }

    return filename;
  }

  public String getUploadId() {
    return uploadId;
  }

  public void setUploadId(String uploadId) {
    this.uploadId = uploadId;
  }

  public String getOriginalFilename() {
    return originalFilename;
  }

  public void setOriginalFilename(String originalFilename) {
    this.originalFilename = originalFilename;
  }

  public String getLocalUri() {
    return localUri;
  }

  public void setLocalUri(String localUri) {
    this.localUri = localUri;
  }

  public String getFileUri() {
    return fileUri;
  }

  public void setFileUri(String fileUri) {
    this.fileUri = fileUri;
  }

  public Integer getRestChunk() {
    return restChunk;
  }

  public void setRestChunk(Integer restChunk) {
    this.restChunk = restChunk;
  }

  public Long getFileSize() {
    return fileSize;
  }

  public void setFileSize(Long fileSize) {
    this.fileSize = fileSize;
  }

  public STORAGE_TYPE getStorageType() {
    return storageType;
  }

  public void setStorageType(STORAGE_TYPE storageType) {
    this.storageType = storageType;
  }
}



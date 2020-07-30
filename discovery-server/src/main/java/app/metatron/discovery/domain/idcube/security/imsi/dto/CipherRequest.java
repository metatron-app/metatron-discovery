package app.metatron.discovery.domain.idcube.security.imsi.dto;

import app.metatron.discovery.domain.datasource.Field;

import java.util.List;

public class CipherRequest {
  private String cipherType;
  private String cipherFieldName;
  private Long identityVerificationId;
  private String csvFile;
  private List<Field> fields;

  public String getCipherType() {
    return cipherType;
  }

  public void setCipherType(String cipherType) {
    this.cipherType = cipherType;
  }

  public String getCipherFieldName() {
    return cipherFieldName;
  }

  public void setCipherFieldName(String cipherFieldName) {
    this.cipherFieldName = cipherFieldName;
  }

  public Long getIdentityVerificationId() {
    return identityVerificationId;
  }

  public void setIdentityVerificationId(Long identityVerificationId) {
    this.identityVerificationId = identityVerificationId;
  }

  public String getCsvFile() {
    return csvFile;
  }

  public void setCsvFile(String csvFile) {
    this.csvFile = csvFile;
  }

  public List<Field> getFields() {
    return fields;
  }

  public void setFields(List<Field> fields) {
    this.fields = fields;
  }
}
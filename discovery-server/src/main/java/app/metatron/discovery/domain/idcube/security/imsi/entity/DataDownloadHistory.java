package app.metatron.discovery.domain.idcube.security.imsi.entity;

import app.metatron.discovery.util.AuthUtils;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "imsi_data_download_histories")
public class DataDownloadHistory {
  @Id
  @GeneratedValue
  private Long id;

  @Column(name = "workbench_id")
  private String workbenchId;

  @Lob
  private String query;

  @Column(name = "crypto_column_name")
  private String cryptoColumnName;

  @Column(name = "crypto_type")
  private String cryptoType;

  @Column(name = "downloaded_by")
  private String downloadedBy;

  @Column(name="downloaded_at")
  private LocalDateTime downloadedAt;

  public DataDownloadHistory() {
  }

  public DataDownloadHistory(String workbenchId, String query, String cryptoColumnName, String cryptoType) {
    this.workbenchId = workbenchId;
    this.query = query;
    this.cryptoColumnName = cryptoColumnName;
    this.cryptoType = cryptoType;
    this.downloadedBy = AuthUtils.getAuthUserName();
    this.downloadedAt = LocalDateTime.now();
  }
}
package app.metatron.discovery.domain.workspace;

import app.metatron.discovery.util.AuthUtils;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "book_data_download_histories")
public class BookDataDownloadHistory {

  @Id
  @GeneratedValue
  private Long id;

  @Column(name = "book_type")
  private String bookType;

  @Column(name = "book_id")
  private String bookId;

  @Lob
  private String query;

  @Column(name = "downloaded_by")
  private String downloadedBy;


//  @Column(name="downloaded_at")
//  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
//  @FieldBridge(impl = JodaTimeSplitBridge.class)
//  @Fields({
//      @Field(name = "downloadedAt.year", index = org.hibernate.search.annotations.Index.YES, analyze = Analyze.NO, store = Store.NO),
//      @Field(name = "downloadedAt.month", index = org.hibernate.search.annotations.Index.YES, analyze = Analyze.NO, store = Store.NO),
//      @Field(name = "downloadedAt.day", index = org.hibernate.search.annotations.Index.YES, analyze = Analyze.NO, store = Store.NO),
//      @Field(name = "downloadedAt.ymd", index = org.hibernate.search.annotations.Index.YES, analyze = Analyze.NO, store = Store.NO),
//      @Field(name = "downloadedAt.mils", index = Index.YES, analyze = Analyze.NO, store = Store.NO),
//  })
//  @SortableField(forField = "downloadedAt.mils")
//  private DateTime downloadedAt;

  @Column(name="downloaded_at")
  private LocalDateTime downloadedAt;

  public BookDataDownloadHistory() {
  }

  public BookDataDownloadHistory(String bookType, String bookId, String query) {
    this.bookType = bookType;
    this.bookId = bookId;
    this.query = query;
    this.downloadedBy = AuthUtils.getAuthUserName();
    this.downloadedAt = LocalDateTime.now();
  }
}

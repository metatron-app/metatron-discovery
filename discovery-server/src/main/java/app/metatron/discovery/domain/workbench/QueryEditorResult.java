package app.metatron.discovery.domain.workbench;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.domain.datasource.Field;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "queryeditor_result")
public class QueryEditorResult {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "qe_id", referencedColumnName = "id")
  private QueryEditor queryEditor;

  @Column(name = "file_path")
  private String filePath;

  @Column(name = "file_absolute_path", length = 2000)
  private String fileAbsolutePath;

  @Lob
  @Column(name = "fields")
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String fields;

  @Lob
  @Column(name="query")
  private String query;

  @Column(name="num_rows")
  private Long numRows;

  @Column(name="default_num_rows")
  private Long defaultNumRows;

  public QueryEditorResult() {
  }

  public QueryEditorResult(String query, String filePath, String fileAbsolutePath, List<Field> fields, Long numRows, Long defaultNumRows) {
    this.query = query;
    this.filePath = filePath;
    this.fileAbsolutePath = fileAbsolutePath;
    this.setFields(fields);
    this.numRows = numRows;
    this.defaultNumRows = defaultNumRows;
  }

  public QueryEditor getQueryEditor() {
    return queryEditor;
  }

  public void setQueryEditor(QueryEditor queryEditor) {
    this.queryEditor = queryEditor;
  }

  public Long getId() {
    return id;
  }

  public String getFilePath() {
    return filePath;
  }

  public void setFields(List<Field> fields) {
    this.fields = GlobalObjectMapper.writeValueAsString(fields);
  }

  public String getFields() {
    return fields;
  }

  public String getQuery() {
    return query;
  }

  public void setFilePath(String filePath) {
    this.filePath = filePath;
  }

  public Long getNumRows() {
    return numRows;
  }

  public Long getDefaultNumRows() {
    return defaultNumRows;
  }

  public void setNumRows(Long numRows) {
    this.numRows = numRows;
  }

  public String getFileAbsolutePath() {
    return fileAbsolutePath;
  }
}

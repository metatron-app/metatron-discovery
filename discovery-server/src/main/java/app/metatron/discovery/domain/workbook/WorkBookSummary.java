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

package app.metatron.discovery.domain.workbook;

import org.joda.time.DateTime;

import java.util.Set;

import app.metatron.discovery.domain.workbook.configurations.WorkBookConfiguration;
import app.metatron.discovery.domain.workspace.Book;

/**
 * WorkBook 요약 정보 모델
 */
public class WorkBookSummary {

  String id;

  String name;

  String description;

  DateTime createdTime;

  DateTime modifiedTime;

  String type;

  WorkBookConfiguration configuration;

  int sheetCount;

  int boardCount;

  int datasourceCount;

  String mainDataSourceName;

  String tag;

  Boolean favorite;

  Set<DashBoard> pages;

  public static WorkBookSummary valueOf(Book book) {
    WorkBookSummary summary = new WorkBookSummary();
    summary.setId(book.getId());
    summary.setName(book.getName());
    summary.setDescription(book.getDescription());
    summary.setCreatedTime(book.getCreatedTime());
    summary.setModifiedTime(book.getModifiedTime());
    summary.setTag(book.getTag());
    summary.setFavorite(book.getFavorite());


    if(book instanceof WorkBook) {

      WorkBook workBook = (WorkBook) book;

      summary.setType(workBook.getType());


      int sheetCount = 0;
      int boardCount = 0;
      int datasourceCount = 0;


      summary.setSheetCount(sheetCount);
      summary.setBoardCount(boardCount);
      summary.setDatasourceCount(datasourceCount);
    }

    return summary;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public DateTime getCreatedTime() {
    return createdTime;
  }

  public void setCreatedTime(DateTime createdTime) {
    this.createdTime = createdTime;
  }

  public DateTime getModifiedTime() {
    return modifiedTime;
  }

  public void setModifiedTime(DateTime modifiedTime) {
    this.modifiedTime = modifiedTime;
  }

  public int getSheetCount() {
    return sheetCount;
  }

  public void setSheetCount(int sheetCount) {
    this.sheetCount = sheetCount;
  }

  public int getBoardCount() {
    return boardCount;
  }

  public void setBoardCount(int boardCount) {
    this.boardCount = boardCount;
  }

  public int getDatasourceCount() {
    return datasourceCount;
  }

  public void setDatasourceCount(int datasourceCount) {
    this.datasourceCount = datasourceCount;
  }

  public String getMainDataSourceName() {
    return mainDataSourceName;
  }

  public void setMainDataSourceName(String mainDataSourceName) {
    this.mainDataSourceName = mainDataSourceName;
  }

  public String getTag() {
    return tag;
  }

  public void setTag(String tag) {
    this.tag = tag;
  }

  public Boolean getFavorite() {
    return favorite;
  }

  public void setFavorite(Boolean favorite) {
    this.favorite = favorite;
  }

  public WorkBookConfiguration getConfiguration() {
    return configuration;
  }

  public void setConfiguration(WorkBookConfiguration configuration) {
    this.configuration = configuration;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }
}

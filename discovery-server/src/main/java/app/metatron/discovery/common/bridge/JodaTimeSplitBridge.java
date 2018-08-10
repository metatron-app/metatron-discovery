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

package app.metatron.discovery.common.bridge;

import org.apache.lucene.document.Document;
import org.apache.lucene.index.IndexableField;
import org.hibernate.search.bridge.LuceneOptions;
import org.hibernate.search.bridge.TwoWayFieldBridge;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;

/**
 * Created by kyungtaak on 2017. 1. 4..
 * http://in.relation.to/2015/07/24/hibernate-search-complex-type-query/
 */
public class JodaTimeSplitBridge implements TwoWayFieldBridge {

  /**
   * Set year, month and day in separate fields
   */
  @Override
  public void set(String name, Object value, Document document, LuceneOptions luceneOptions) {
    DateTime datetime = (DateTime) value;

    if(name.endsWith("year")) {
      luceneOptions.addFieldToDocument(
          name, String.valueOf(datetime.getYear()), document
      );
    } else if(name.endsWith("month")) {
      luceneOptions.addFieldToDocument(
          name, String.valueOf(datetime.getMonthOfYear()), document
      );
    } else if(name.endsWith("day")) {
      luceneOptions.addFieldToDocument(
          name, String.valueOf(datetime.getDayOfMonth()), document
      );
    } else if(name.endsWith("ymd")) {
      luceneOptions.addFieldToDocument(
          name, datetime.toString("yyyy-MM-dd"), document
      );
    } else if(name.endsWith("mils")) {
      luceneOptions.addFieldToDocument(
          name, String.format("%013d", datetime.getMillis()), document
      );
    }

  }

  @Override
  public Object get(String name, Document document) {
    IndexableField fieldymd = document.getField(name + ".ymd");
    DateTime value = DateTime.parse(fieldymd.stringValue(), DateTimeFormat.forPattern("yyyy-MM-dd"));
    return String.valueOf(value);
  }

  @Override
  public String objectToString(Object date) {
    DateTime datetime = (DateTime) date;
    return datetime.toString("yyyy-MM-dd");
  }
}

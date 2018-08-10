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

package app.metatron.discovery.domain.user;

import org.joda.time.DateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "user_preference")
public class UserPreference {

  @Id
  @Column(name = "id")
  String username;

  @Column(name = "user_lang")
  String language;

  @Column(name = "user_locale")
  String locale;

  @Column(name = "user_timezone")
  String timezone;

  @Column(name = "user_last_access_time")
  DateTime lastAccessTime;

  public UserPreference() {
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getLanguage() {
    return language;
  }

  public void setLanguage(String language) {
    this.language = language;
  }

  public String getLocale() {
    return locale;
  }

  public void setLocale(String locale) {
    this.locale = locale;
  }

  public String getTimezone() {
    return timezone;
  }

  public void setTimezone(String timezone) {
    this.timezone = timezone;
  }

  public DateTime getLastAccessTime() {
    return lastAccessTime;
  }

  public void setLastAccessTime(DateTime lastAccessTime) {
    this.lastAccessTime = lastAccessTime;
  }

  @Override
  public String toString() {
    return "UserPreference{" +
        "username='" + username + '\'' +
        ", language='" + language + '\'' +
        ", locale='" + locale + '\'' +
        ", timezone='" + timezone + '\'' +
        ", lastAccessTime=" + lastAccessTime +
        '}';
  }
}

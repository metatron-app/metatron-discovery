
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

package app.metatron.discovery.extension.dataconnection.jdbc;

import java.util.Map;

public interface JdbcConnectInformation {
  AuthenticationType getAuthenticationType();
  String getImplementor();
  String getUrl();
  String getOptions();
  String getHostname();
  Integer getPort();
  String getDatabase();
  String getSid();
  String getCatalog();
  String getProperties();
  String getUsername();
  String getPassword();
  Map<String, String> getPropertiesMap();

  enum AuthenticationType {
    MANUAL, USERINFO, DIALOG
  }
}


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

/**
 * The interface Jdbc connect information.
 */
public interface JdbcConnectInformation {
  /**
   * Gets authentication type.
   *
   * @return the authentication type
   */
  AuthenticationType getAuthenticationType();

  /**
   * Gets implementor.
   *
   * @return the implementor
   */
  String getImplementor();

  /**
   * Gets url.
   *
   * @return the url
   */
  String getUrl();

  /**
   * Gets options.
   *
   * @return the options
   */
  String getOptions();

  /**
   * Gets hostname.
   *
   * @return the hostname
   */
  String getHostname();

  /**
   * Gets port.
   *
   * @return the port
   */
  Integer getPort();

  /**
   * Gets database.
   *
   * @return the database
   */
  String getDatabase();

  /**
   * Gets sid.
   *
   * @return the sid
   */
  String getSid();

  /**
   * Gets catalog.
   *
   * @return the catalog
   */
  String getCatalog();

  /**
   * Gets properties.
   *
   * @return the properties
   */
  String getProperties();

  /**
   * Gets username.
   *
   * @return the username
   */
  String getUsername();

  /**
   * Gets password.
   *
   * @return the password
   */
  String getPassword();

  /**
   * Gets properties map.
   *
   * @return the properties map
   */
  Map<String, String> getPropertiesMap();

  /**
   * The enum Authentication type.
   */
  enum AuthenticationType {
    /**
     * Manual authentication type.
     */
    MANUAL,
    /**
     * Userinfo authentication type.
     */
    USERINFO,
    /**
     * Dialog authentication type.
     */
    DIALOG
  }
}

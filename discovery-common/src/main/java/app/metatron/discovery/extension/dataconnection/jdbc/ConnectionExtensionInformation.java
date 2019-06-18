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

import app.metatron.discovery.extension.ExtensionInformation;

/**
 * The type Connection extension information.
 */
public class ConnectionExtensionInformation implements ExtensionInformation {

  /**
   * The Name.
   */
  String name;
  /**
   * The Dialect type.
   */
  DialectType dialectType;
  /**
   * The Icon resource 1.
   */
  String iconResource1;
  /**
   * The Icon resource 2.
   */
  String iconResource2;
  /**
   * The Icon resource 3.
   */
  String iconResource3;
  /**
   * The Icon resource 4.
   */
  String iconResource4;
  /**
   * The Implementor.
   */
  String implementor;
  /**
   * The Input mandatory spec.
   */
  InputMandatorySpec inputMandatorySpec;

  @Override
  public String getName() {
    return name;
  }

  /**
   * Sets name.
   *
   * @param name the name
   * @return the name
   */
  public ConnectionExtensionInformation setName(String name) {
    this.name = name;
    return this;
  }

  /**
   * Gets dialect type.
   *
   * @return the dialect type
   */
  public DialectType getDialectType() {
    return dialectType;
  }

  /**
   * Sets dialect type.
   *
   * @param dialectType the dialect type
   * @return the dialect type
   */
  public ConnectionExtensionInformation setDialectType(DialectType dialectType) {
    this.dialectType = dialectType;
    return this;
  }

  /**
   * Gets icon resource 1.
   *
   * @return the icon resource 1
   */
  public String getIconResource1() {
    return iconResource1;
  }

  /**
   * Sets icon resource 1.
   *
   * @param iconResource1 the icon resource 1
   * @return the icon resource 1
   */
  public ConnectionExtensionInformation setIconResource1(String iconResource1) {
    this.iconResource1 = iconResource1;
    return this;
  }

  /**
   * Gets icon resource 2.
   *
   * @return the icon resource 2
   */
  public String getIconResource2() {
    return iconResource2;
  }

  /**
   * Sets icon resource 2.
   *
   * @param iconResource2 the icon resource 2
   * @return the icon resource 2
   */
  public ConnectionExtensionInformation setIconResource2(String iconResource2) {
    this.iconResource2 = iconResource2;
    return this;
  }

  /**
   * Gets icon resource 3.
   *
   * @return the icon resource 3
   */
  public String getIconResource3() {
    return iconResource3;
  }

  /**
   * Sets icon resource 3.
   *
   * @param iconResource3 the icon resource 3
   * @return the icon resource 3
   */
  public ConnectionExtensionInformation setIconResource3(String iconResource3) {
    this.iconResource3 = iconResource3;
    return this;
  }

  /**
   * Gets icon resource 4.
   *
   * @return the icon resource 4
   */
  public String getIconResource4() {
    return iconResource4;
  }

  /**
   * Sets icon resource 4.
   *
   * @param iconResource4 the icon resource 4
   * @return the icon resource 4
   */
  public ConnectionExtensionInformation setIconResource4(String iconResource4) {
    this.iconResource4 = iconResource4;
    return this;
  }

  /**
   * Gets implementor.
   *
   * @return the implementor
   */
  public String getImplementor() {
    return implementor;
  }

  /**
   * Sets implementor.
   *
   * @param implementor the implementor
   * @return the implementor
   */
  public ConnectionExtensionInformation setImplementor(String implementor) {
    this.implementor = implementor;
    return this;
  }

  /**
   * Gets input mandatory spec.
   *
   * @return the input mandatory spec
   */
  public InputMandatorySpec getInputMandatorySpec() {
    return inputMandatorySpec;
  }

  /**
   * Sets input mandatory spec.
   *
   * @param inputMandatorySpec the input mandatory spec
   * @return the input mandatory spec
   */
  public ConnectionExtensionInformation setInputMandatorySpec(InputMandatorySpec inputMandatorySpec) {
    this.inputMandatorySpec = inputMandatorySpec;
    return this;
  }

  /**
   * The enum Dialect type.
   */
  public enum DialectType {
    /**
     * Embedded dialect type.
     */
    EMBEDDED,
    /**
     * Extension dialect type.
     */
    EXTENSION
  }

  /**
   * The enum Input mandatory.
   */
  public enum InputMandatory {
    /**
     * None input mandatory.
     */
    NONE,
    /**
     * Optional input mandatory.
     */
    OPTIONAL,
    /**
     * Mandatory input mandatory.
     */
    MANDATORY
  }

  /**
   * The type Input mandatory spec.
   */
  class InputMandatorySpec{
    /**
     * Instantiates a new Input mandatory spec.
     */
    public InputMandatorySpec(){

    }

    /**
     * The Implementor.
     */
    final InputMandatory implementor = InputMandatory.MANDATORY;
    /**
     * The Authentication type.
     */
    InputMandatory authenticationType = InputMandatory.OPTIONAL;
    /**
     * The Url.
     */
    InputMandatory url = InputMandatory.OPTIONAL;
    /**
     * The Options.
     */
    InputMandatory options = InputMandatory.OPTIONAL;
    /**
     * The Hostname.
     */
    InputMandatory hostname = InputMandatory.OPTIONAL;
    /**
     * The Port.
     */
    InputMandatory port = InputMandatory.OPTIONAL;
    /**
     * The Database.
     */
    InputMandatory database = InputMandatory.OPTIONAL;
    /**
     * The Sid.
     */
    InputMandatory sid = InputMandatory.OPTIONAL;
    /**
     * The Catalog.
     */
    InputMandatory catalog = InputMandatory.OPTIONAL;
    /**
     * The Properties.
     */
    InputMandatory properties = InputMandatory.OPTIONAL;
    /**
     * The Username.
     */
    InputMandatory username = InputMandatory.OPTIONAL;
    /**
     * The Password.
     */
    InputMandatory password = InputMandatory.OPTIONAL;

    /**
     * Gets authentication type.
     *
     * @return the authentication type
     */
    public InputMandatory getAuthenticationType() {
      return authenticationType;
    }

    /**
     * Gets implementor.
     *
     * @return the implementor
     */
    public InputMandatory getImplementor() {
      return implementor;
    }

    /**
     * Gets url.
     *
     * @return the url
     */
    public InputMandatory getUrl() {
      return url;
    }

    /**
     * Gets options.
     *
     * @return the options
     */
    public InputMandatory getOptions() {
      return options;
    }

    /**
     * Gets hostname.
     *
     * @return the hostname
     */
    public InputMandatory getHostname() {
      return hostname;
    }

    /**
     * Gets port.
     *
     * @return the port
     */
    public InputMandatory getPort() {
      return port;
    }

    /**
     * Gets database.
     *
     * @return the database
     */
    public InputMandatory getDatabase() {
      return database;
    }

    /**
     * Gets sid.
     *
     * @return the sid
     */
    public InputMandatory getSid() {
      return sid;
    }

    /**
     * Gets catalog.
     *
     * @return the catalog
     */
    public InputMandatory getCatalog() {
      return catalog;
    }

    /**
     * Gets properties.
     *
     * @return the properties
     */
    public InputMandatory getProperties() {
      return properties;
    }

    /**
     * Gets username.
     *
     * @return the username
     */
    public InputMandatory getUsername() {
      return username;
    }

    /**
     * Gets password.
     *
     * @return the password
     */
    public InputMandatory getPassword() {
      return password;
    }

    /**
     * Set authentication type input mandatory spec.
     *
     * @param authenticationType the authentication type
     * @return the input mandatory spec
     */
    public InputMandatorySpec setAuthenticationType(InputMandatory authenticationType){
      this.authenticationType = authenticationType;
      return this;
    }

    /**
     * Sets url.
     *
     * @param url the url
     * @return the url
     */
    public InputMandatorySpec setUrl(InputMandatory url) {
      this.url = url;
      return this;
    }

    /**
     * Sets options.
     *
     * @param options the options
     * @return the options
     */
    public InputMandatorySpec setOptions(InputMandatory options) {
      this.options = options;
      return this;
    }

    /**
     * Sets hostname.
     *
     * @param hostname the hostname
     * @return the hostname
     */
    public InputMandatorySpec setHostname(InputMandatory hostname) {
      this.hostname = hostname;
      return this;
    }

    /**
     * Sets port.
     *
     * @param port the port
     * @return the port
     */
    public InputMandatorySpec setPort(InputMandatory port) {
      this.port = port;
      return this;
    }

    /**
     * Sets database.
     *
     * @param database the database
     * @return the database
     */
    public InputMandatorySpec setDatabase(InputMandatory database) {
      this.database = database;
      return this;
    }

    /**
     * Sets sid.
     *
     * @param sid the sid
     * @return the sid
     */
    public InputMandatorySpec setSid(InputMandatory sid) {
      this.sid = sid;
      return this;
    }

    /**
     * Sets catalog.
     *
     * @param catalog the catalog
     * @return the catalog
     */
    public InputMandatorySpec setCatalog(InputMandatory catalog) {
      this.catalog = catalog;
      return this;
    }

    /**
     * Sets properties.
     *
     * @param properties the properties
     * @return the properties
     */
    public InputMandatorySpec setProperties(InputMandatory properties) {
      this.properties = properties;
      return this;
    }

    /**
     * Sets username.
     *
     * @param username the username
     * @return the username
     */
    public InputMandatorySpec setUsername(InputMandatory username) {
      this.username = username;
      return this;
    }

    /**
     * Sets password.
     *
     * @param password the password
     * @return the password
     */
    public InputMandatorySpec setPassword(InputMandatory password) {
      this.password = password;
      return this;
    }
  }
}

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
 *
 */
public class ConnectionExtensionInformation implements ExtensionInformation {
  
  String name;
  DialectType dialectType;
  String iconResource1;
  String iconResource2;
  String iconResource3;
  String iconResource4;
  String implementor;
  InputMandatorySpec inputMandatorySpec;

  @Override
  public String getName() {
    return name;
  }

  public ConnectionExtensionInformation setName(String name) {
    this.name = name;
    return this;
  }

  public DialectType getDialectType() {
    return dialectType;
  }

  public ConnectionExtensionInformation setDialectType(DialectType dialectType) {
    this.dialectType = dialectType;
    return this;
  }

  public String getIconResource1() {
    return iconResource1;
  }

  public ConnectionExtensionInformation setIconResource1(String iconResource1) {
    this.iconResource1 = iconResource1;
    return this;
  }

  public String getIconResource2() {
    return iconResource2;
  }

  public ConnectionExtensionInformation setIconResource2(String iconResource2) {
    this.iconResource2 = iconResource2;
    return this;
  }

  public String getIconResource3() {
    return iconResource3;
  }

  public ConnectionExtensionInformation setIconResource3(String iconResource3) {
    this.iconResource3 = iconResource3;
    return this;
  }

  public String getIconResource4() {
    return iconResource4;
  }

  public ConnectionExtensionInformation setIconResource4(String iconResource4) {
    this.iconResource4 = iconResource4;
    return this;
  }

  public String getImplementor() {
    return implementor;
  }

  public ConnectionExtensionInformation setImplementor(String implementor) {
    this.implementor = implementor;
    return this;
  }

  public InputMandatorySpec getInputMandatorySpec() {
    return inputMandatorySpec;
  }

  public ConnectionExtensionInformation setInputMandatorySpec(InputMandatorySpec inputMandatorySpec) {
    this.inputMandatorySpec = inputMandatorySpec;
    return this;
  }

  public enum DialectType {
    EMBEDDED, EXTENSION
  }

  public enum InputMandatory {
    NONE, OPTIONAL, MANDATORY
  }

  class InputMandatorySpec{
    public InputMandatorySpec(){

    }

    final InputMandatory implementor = InputMandatory.MANDATORY;
    InputMandatory authenticationType = InputMandatory.OPTIONAL;
    InputMandatory url = InputMandatory.OPTIONAL;
    InputMandatory options = InputMandatory.OPTIONAL;
    InputMandatory hostname = InputMandatory.OPTIONAL;
    InputMandatory port = InputMandatory.OPTIONAL;
    InputMandatory database = InputMandatory.OPTIONAL;
    InputMandatory sid = InputMandatory.OPTIONAL;
    InputMandatory catalog = InputMandatory.OPTIONAL;
    InputMandatory properties = InputMandatory.OPTIONAL;
    InputMandatory username = InputMandatory.OPTIONAL;
    InputMandatory password = InputMandatory.OPTIONAL;

    public InputMandatory getAuthenticationType() {
      return authenticationType;
    }

    public InputMandatory getImplementor() {
      return implementor;
    }

    public InputMandatory getUrl() {
      return url;
    }

    public InputMandatory getOptions() {
      return options;
    }

    public InputMandatory getHostname() {
      return hostname;
    }

    public InputMandatory getPort() {
      return port;
    }

    public InputMandatory getDatabase() {
      return database;
    }

    public InputMandatory getSid() {
      return sid;
    }

    public InputMandatory getCatalog() {
      return catalog;
    }

    public InputMandatory getProperties() {
      return properties;
    }

    public InputMandatory getUsername() {
      return username;
    }

    public InputMandatory getPassword() {
      return password;
    }

    public InputMandatorySpec setAuthenticationType(InputMandatory authenticationType){
      this.authenticationType = authenticationType;
      return this;
    }

    public InputMandatorySpec setUrl(InputMandatory url) {
      this.url = url;
      return this;
    }

    public InputMandatorySpec setOptions(InputMandatory options) {
      this.options = options;
      return this;
    }

    public InputMandatorySpec setHostname(InputMandatory hostname) {
      this.hostname = hostname;
      return this;
    }

    public InputMandatorySpec setPort(InputMandatory port) {
      this.port = port;
      return this;
    }

    public InputMandatorySpec setDatabase(InputMandatory database) {
      this.database = database;
      return this;
    }

    public InputMandatorySpec setSid(InputMandatory sid) {
      this.sid = sid;
      return this;
    }

    public InputMandatorySpec setCatalog(InputMandatory catalog) {
      this.catalog = catalog;
      return this;
    }

    public InputMandatorySpec setProperties(InputMandatory properties) {
      this.properties = properties;
      return this;
    }

    public InputMandatorySpec setUsername(InputMandatory username) {
      this.username = username;
      return this;
    }

    public InputMandatorySpec setPassword(InputMandatory password) {
      this.password = password;
      return this;
    }
  }
}

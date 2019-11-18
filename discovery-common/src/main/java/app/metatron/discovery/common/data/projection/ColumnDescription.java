/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.common.data.projection;

import java.util.Map;

/**
 * The type Column description.
 */
public class ColumnDescription {
  /**
   * The Logical Name.
   */
  String name;
  /**
   * The Logical Type.
   */
  String type;
  /**
   * The Physical name.
   */
  String physicalName;
  /**
   * The Physical type.
   */
  String physicalType;
  /**
   * The Format.
   */
  Map<String, Object> format;
  /**
   * The Additionals.
   */
  Map<String, Object> additionals;

  /**
   * Instantiates a new Column description.
   *
   * @param name         the name
   * @param type         the type
   * @param physicalName the physical name
   * @param physicalType the physical type
   * @param format       the format
   * @param additionals  the additionals
   */
  public ColumnDescription(String name, String type, String physicalName, String physicalType, Map<String, Object> format, Map<String, Object> additionals) {
    this.name = name;
    this.type = type;
    this.physicalName = physicalName;
    this.physicalType = physicalType;
    this.format = format;
    this.additionals = additionals;
  }

  /**
   * Gets name.
   *
   * @return the name
   */
  public String getName() {
    return name;
  }

  /**
   * Sets name.
   *
   * @param name the name
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * Gets type.
   *
   * @return the type
   */
  public String getType() {
    return type;
  }

  /**
   * Sets type.
   *
   * @param type the type
   */
  public void setType(String type) {
    this.type = type;
  }

  /**
   * Gets physical name.
   *
   * @return the physical name
   */
  public String getPhysicalName() {
    return physicalName;
  }

  /**
   * Sets physical name.
   *
   * @param physicalName the physical name
   */
  public void setPhysicalName(String physicalName) {
    this.physicalName = physicalName;
  }

  /**
   * Gets physical type.
   *
   * @return the physical type
   */
  public String getPhysicalType() {
    return physicalType;
  }

  /**
   * Sets physical type.
   *
   * @param physicalType the physical type
   */
  public void setPhysicalType(String physicalType) {
    this.physicalType = physicalType;
  }

  /**
   * Gets format.
   *
   * @return the format
   */
  public Map<String, Object> getFormat() {
    return format;
  }

  /**
   * Sets format.
   *
   * @param format the format
   */
  public void setFormat(Map<String, Object> format) {
    this.format = format;
  }

  /**
   * Gets additionals.
   *
   * @return the additionals
   */
  public Map<String, Object> getAdditionals() {
    return additionals;
  }

  /**
   * Sets additionals.
   *
   * @param additionals the additionals
   */
  public void setAdditionals(Map<String, Object> additionals) {
    this.additionals = additionals;
  }
}

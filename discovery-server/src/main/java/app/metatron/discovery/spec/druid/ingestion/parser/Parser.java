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

package app.metatron.discovery.spec.druid.ingestion.parser;

/**
 * Created by kyungtaak on 2016. 6. 17..
 */
public class Parser {

  String type;

  ParseSpec parseSpec;

  String typeString; // FIXME: 추후 ORC 타입으로 분리할것

  public Parser() {
  }

  public Parser(String type, ParseSpec parseSpec) {
    this.type = type;
    this.parseSpec = parseSpec;
  }

  public Parser(String type, ParseSpec parseSpec, String typeString) {
    this.type = type;
    this.parseSpec = parseSpec;
    this.typeString = typeString;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public ParseSpec getParseSpec() {
    return parseSpec;
  }

  public void setParseSpec(ParseSpec parseSpec) {
    this.parseSpec = parseSpec;
  }

  public String getTypeString() {
    return typeString;
  }

  public void setTypeString(String typeString) {
    this.typeString = typeString;
  }
}

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

package app.metatron.discovery.common;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Created by kyungtaak on 2017. 1. 26..
 */
@Component
@ConfigurationProperties(prefix = "polaris")
public class MetatronProperties {

  private final Map<String, Object> format = Maps.newHashMap();

  private final Mail mail = new Mail();

  private final List<Cors> cors = Lists.newArrayList();

  private Integer csvMaxCharsPerColumn = 1024 * 30;

  private String loginDelegationUrl;

  public String getLoginDelegationUrl() {
    return loginDelegationUrl;
  }

  public void setLoginDelegationUrl(String loginDelegationUrl) {
    this.loginDelegationUrl = loginDelegationUrl;
  }

  public Map<String, Object> getFormat() {
    return format;
  }

  public Mail getMail() {
    return mail;
  }

  public List<Cors> getCors() {
    return cors;
  }

  public List<String> getTimeFormats() {

    List<String> formats = Lists.newArrayList();
    if (!format.containsKey("datetimes")) {
      return formats;
    }

    // 결과는 key 가 리스트 인덱스, value 가 값임, { "0": "yyyy-MM-dd", ...}
    Object result = format.get("datetimes");
    formats.addAll(((Map) result).values());

    return formats;
  }

  public Integer getCsvMaxCharsPerColumn() {
    return csvMaxCharsPerColumn;
  }

  public void setCsvMaxCharsPerColumn(Integer csvMaxCharsPerColumn) {
    this.csvMaxCharsPerColumn = csvMaxCharsPerColumn;
  }

  public static class Mail {

    private String from = "admin@metatron.com";

    private String admin = "admin@metatron.com";

    private String baseUrl = "";

    public String getFrom() {
      return from;
    }

    public void setFrom(String from) {
      this.from = from;
    }

    public String getBaseUrl() {
      return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
      this.baseUrl = baseUrl;
    }

    public String getAdmin() {
      return admin;
    }

    public void setAdmin(String admin) {
      this.admin = admin;
    }
  }

  public static class Cors {

    private String mapping;

    private String allowedOrigins = "*";

    private String allowedMethods = "GET,HEAD,POST";

    private String allowedHeaders = "*";

    private String exposedHeaders;

    private Boolean allowCredentials = false;

    private Integer maxAge = 3600;

    public Cors() {
    }

    public List<String> getAllowOriginList() {
      return Lists.newArrayList(StringUtils.split(allowedOrigins, ","));
    }

    public List<String> getAllowedMethodList() {
      return Lists.newArrayList(StringUtils.split(allowedMethods, ","));
    }

    public List<String> getAllowedHeadersList() {
      return Lists.newArrayList(StringUtils.split(allowedHeaders, ","));
    }

    public List<String> getExposedHeadersList() {
      if(exposedHeaders == null) {
        return null;
      }
      return Lists.newArrayList(StringUtils.split(exposedHeaders, ","));
    }

    public String getMapping() {
      return mapping;
    }

    public void setMapping(String mapping) {
      this.mapping = mapping;
    }

    public String getAllowedOrigins() {
      return allowedOrigins;
    }

    public void setAllowedOrigins(String allowedOrigins) {
      this.allowedOrigins = allowedOrigins;
    }

    public String getAllowedMethods() {
      return allowedMethods;
    }

    public void setAllowedMethods(String allowedMethods) {
      this.allowedMethods = allowedMethods;
    }

    public String getAllowedHeaders() {
      return allowedHeaders;
    }

    public void setAllowedHeaders(String allowedHeaders) {
      this.allowedHeaders = allowedHeaders;
    }

    public String getExposedHeaders() {
      return exposedHeaders;
    }

    public void setExposedHeaders(String exposedHeaders) {
      this.exposedHeaders = exposedHeaders;
    }

    public Boolean getAllowCredentials() {
      return allowCredentials;
    }

    public void setAllowCredentials(Boolean allowCredentials) {
      this.allowCredentials = allowCredentials;
    }

    public Integer getMaxAge() {
      return maxAge;
    }

    public void setMaxAge(Integer maxAge) {
      this.maxAge = maxAge;
    }
  }

}

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

/**
 * Created by kyungtaak on 2016. 11. 20..
 */
public class CommonLocalVariable {

  private static final ThreadLocal<LocalVariable> managementsThreadLocal =
      new ThreadLocal<LocalVariable>() {
        protected LocalVariable initialValue() {
          return new LocalVariable();
        }
      };

  public static LocalVariable getLocalVariable() {
    return managementsThreadLocal.get();
  }

  public static void remove() {
    managementsThreadLocal.remove();
  }

  public static void setQueryId(String queryId) {
    LocalVariable localVariable = getLocalVariable();
    localVariable.setQueryId(queryId);
  }

  public static void generateQueryId() {
    LocalVariable localVariable = getLocalVariable();
    localVariable.setQueryId(IdGenerator.queryId());
  }

  public static String getQueryId() {
    return getLocalVariable().getQueryId();
  }

  public static class LocalVariable {

    /**
     * Query Id
     */
    String queryId;

    String userId;

    TenantAuthority TenantAuthority = new TenantAuthority();

    public String getQueryId() {
      return queryId == null ? "UNKNOWN" : queryId;
    }

    public void setQueryId(String queryId) {
      this.queryId = queryId;
    }

    public String getUserId() {
      return userId;
    }

    public void setUserId(String userId) {
      this.userId = userId;
    }

    public CommonLocalVariable.TenantAuthority getTenantAuthority() {
      return TenantAuthority;
    }

    public void setTenantAuthority(CommonLocalVariable.TenantAuthority tenantAuthority) {
      TenantAuthority = tenantAuthority;
    }
  }

  public static class TenantAuthority{

    /**
     * Users OrgCode
     */
    String orgCode;

    public String getOrgCode() {
      return orgCode;
    }

    public void setOrgCode(String orgCode) {
      this.orgCode = orgCode;
    }
  }
}

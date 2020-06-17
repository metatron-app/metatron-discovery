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

import java.io.Serializable;

/**
 *
 */
public class UserPasswordProperties {

  PasswordStrength strength = new PasswordStrength();

  String requiredChangePeriod;

  String minimumUsePeriod;

  Integer countOfHistory = -1;
  Integer lockCount;

  public UserPasswordProperties() {
    // Empty Constructor
  }

  public PasswordStrength getStrength() {
    return strength;
  }

  public void setStrength(PasswordStrength strength) {
    this.strength = strength;
  }

  public String getRequiredChangePeriod() {
    return requiredChangePeriod;
  }

  public void setRequiredChangePeriod(String requiredChangePeriod) {
    this.requiredChangePeriod = requiredChangePeriod;
  }

  public String getMinimumUsePeriod() {
    return minimumUsePeriod;
  }

  public void setMinimumUsePeriod(String minimumUsePeriod) {
    this.minimumUsePeriod = minimumUsePeriod;
  }

  public Integer getCountOfHistory() {
    return countOfHistory;
  }

  public void setCountOfHistory(Integer countOfHistory) {
    this.countOfHistory = countOfHistory;
  }

  public Integer getLockCount() {
    return lockCount;
  }

  public void setLockCount(Integer lockCount) {
    this.lockCount = lockCount;
  }

  public static class PasswordStrength implements Serializable {

    Integer numberOfNumericCharacter = 1;

    Integer numberOfAlphabeticalCharacter = 1;

    Integer numberOfSpecialCharacter = 1;

    Integer minLength = 10;

    Integer maxLength = 20;

    Integer repeatLimit = 4;

    public PasswordStrength(){
      // Empty Constructor
    }

    public String getPasswordRegExp(){
      StringBuilder stringBuilder = new StringBuilder();
      stringBuilder.append("^");

      // numeric char
      if(numberOfNumericCharacter != null && numberOfNumericCharacter > 0){
        stringBuilder.append("(?=");
        for(int i = 0; i < numberOfNumericCharacter; ++i){
          stringBuilder.append(".*[0-9]");
        }
        stringBuilder.append(")");
      }

      // alphabet char
      if(numberOfAlphabeticalCharacter != null && numberOfAlphabeticalCharacter > 0){
        stringBuilder.append("(?=");
        for(int i = 0; i < numberOfAlphabeticalCharacter; ++i){
          stringBuilder.append(".*[a-zA-Z]");
        }
        stringBuilder.append(")");
      }

      // special char
      if(numberOfSpecialCharacter != null && numberOfSpecialCharacter > 0){
        stringBuilder.append("(?=");
        for(int i = 0; i < numberOfSpecialCharacter; ++i){
          stringBuilder.append(".*[!@#$%^*()\\-_=+\\\\\\|\\[\\]{};:\\'\",.<>\\/?`~]");
        }
        stringBuilder.append(")");
      }

      //repeat limit
      if(repeatLimit != null && repeatLimit > 1){
        stringBuilder.append("(?!.*(.)");
        for(int i = 0; i < repeatLimit - 1; ++i){
          stringBuilder.append("\\1");
        }
        stringBuilder.append(")");
      }

      // length
      stringBuilder.append(".{");
      stringBuilder.append(Math.max(0, minLength));
      stringBuilder.append(",");
      if(maxLength > Math.max(0, minLength)){
        stringBuilder.append(maxLength);
      }
      stringBuilder.append("}");

      stringBuilder.append("$");
      return stringBuilder.toString();
    }

    public Integer getNumberOfNumericCharacter() {
      return numberOfNumericCharacter;
    }

    public void setNumberOfNumericCharacter(Integer numberOfNumericCharacter) {
      this.numberOfNumericCharacter = numberOfNumericCharacter;
    }

    public Integer getNumberOfAlphabeticalCharacter() {
      return numberOfAlphabeticalCharacter;
    }

    public void setNumberOfAlphabeticalCharacter(Integer numberOfAlphabeticalCharacter) {
      this.numberOfAlphabeticalCharacter = numberOfAlphabeticalCharacter;
    }

    public Integer getNumberOfSpecialCharacter() {
      return numberOfSpecialCharacter;
    }

    public void setNumberOfSpecialCharacter(Integer numberOfSpecialCharacter) {
      this.numberOfSpecialCharacter = numberOfSpecialCharacter;
    }

    public Integer getMinLength() {
      return minLength;
    }

    public void setMinLength(Integer minLength) {
      this.minLength = minLength;
    }

    public Integer getMaxLength() {
      return maxLength;
    }

    public void setMaxLength(Integer maxLength) {
      this.maxLength = maxLength;
    }

    public Integer getRepeatLimit() {
      return repeatLimit;
    }

    public void setRepeatLimit(Integer repeatLimit) {
      this.repeatLimit = repeatLimit;
    }
  }
}

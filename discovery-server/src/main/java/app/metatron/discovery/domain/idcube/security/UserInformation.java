package app.metatron.discovery.domain.idcube.security;

import com.sk.idcube.common.security.IDCubeSecurity;
import org.apache.commons.lang.StringUtils;

public class UserInformation {
  private String telNo;
  private String email;

  public String getTelNo() {
    return telNo;
  }

  public void setTelNo(String telNo) {
    this.telNo = telNo;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public void decrypt(IDCubeSecurity security) {
    if (StringUtils.isNotEmpty(this.telNo)) {
      this.telNo = this.decryptString(security, this.telNo);
    }

    if (StringUtils.isNotEmpty(this.email)) {
      this.email = this.decryptString(security, this.email);
    }
  }

  private String decryptString(IDCubeSecurity security, String encryptedString) {
    String decryptedString;
    try {
      decryptedString = security.decrypt(encryptedString);
    } catch (Exception e) {
      decryptedString = "복호화에 실패 했습니다";
    }

    return decryptedString;
  }

  @Override
  public String toString() {
    return "UserInformation{" +
        "telNo='" + telNo + '\'' +
        ", email='" + email + '\'' +
        '}';
  }
}

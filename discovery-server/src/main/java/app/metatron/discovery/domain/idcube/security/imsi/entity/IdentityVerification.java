package app.metatron.discovery.domain.idcube.security.imsi.entity;

import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.idcube.IdCubeErrorCodes;
import app.metatron.discovery.domain.idcube.security.imsi.adapter.TangoAdapter;
import app.metatron.discovery.util.ApplicationContextProvider;
import org.apache.commons.lang.StringUtils;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Random;

@Entity
@Table(name = "imsi_identity_verification")
public class IdentityVerification {
  private final static int CERT_NUM_LENGTH = 5;

  @Id
  @GeneratedValue
  private Long id;

  @Column(name = "auth_number")
  private String authNumber;

  @Column(name = "user_id")
  private String userId;

  @Column(name = "receiver_tel_no")
  private String receiverTelNo;

  @Column(name = "receiver_name")
  private String receiverName;

  private Boolean verified;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  public IdentityVerification() {
  }

  public IdentityVerification(final String userId, final String receiverTelNo, final String receiverName) {
    if(StringUtils.isBlank(userId) || StringUtils.isBlank(receiverTelNo) || StringUtils.isBlank(receiverName)) {
      throw new RuntimeException("userId, receiverTelNo and receiverName are required.");
    }

    this.authNumber = this.generateAuthNumber();
    this.userId = userId;
    this.receiverTelNo = receiverTelNo;
    this.receiverName = receiverName;
    this.verified = false;
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  private String generateAuthNumber() {
    Random random = new Random(System.currentTimeMillis());

    int range = (int)Math.pow(10, CERT_NUM_LENGTH);
    int trim = (int)Math.pow(10, CERT_NUM_LENGTH-1);
    int result = random.nextInt(range)+trim;

    if(result>range){
      result = result - trim;
    }

    return String.valueOf(result);
  }

  public void sendAuthNumberWithSMS() {
    TangoAdapter adapter = ApplicationContextProvider.getApplicationContext().getBean(TangoAdapter.class);
    adapter.sendSMS(this.receiverName, this.receiverTelNo, this.authNumber);
  }

  public Long getId() {
    return id;
  }

  public boolean verifyAuthNumber(String receivedAuthNumber) {
    this.validateExpired();

    if (this.authNumber.equalsIgnoreCase(receivedAuthNumber)) {
      this.verified = true;
      this.updatedAt = LocalDateTime.now();
      return true;
    } else {
      return false;
    }
  }

  private void validateExpired() {
    if (LocalDateTime.now().isAfter(this.createdAt.plusMinutes(3))) {
      throw new MetatronException(IdCubeErrorCodes.IMSI_AUTHENTICATION_INPUT_TIMEOUT_ERROR_CODE, "User authentication input timeout.");
    }
  }

  public Boolean getVerified() {
    return verified;
  }

  public void setReceiverTelNo(String receiverTelNo) {
    this.receiverTelNo = receiverTelNo;
  }
}

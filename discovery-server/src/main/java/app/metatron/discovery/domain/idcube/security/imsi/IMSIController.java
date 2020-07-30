package app.metatron.discovery.domain.idcube.security.imsi;

import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.idcube.security.imsi.dto.CipherRequest;
import app.metatron.discovery.domain.idcube.security.imsi.entity.IdentityVerification;
import app.metatron.discovery.domain.idcube.security.imsi.repository.IdentityVerificationRepository;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.workbench.WorkbenchProperties;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.HttpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/idcube/imsi")
public class IMSIController {

  private UserRepository userRepository;

  private IdentityVerificationRepository identityVerificationRepository;

  @Autowired
  public void setIdentityVerificationRepository(IdentityVerificationRepository identityVerificationRepository) {
    this.identityVerificationRepository = identityVerificationRepository;
  }

  @Autowired
  public void setUserRepository(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Autowired
  private WorkbenchProperties workbenchProperties;

  @PostMapping(value = "/identity-verification")
  public ResponseEntity<?> doIdentityVerification() {
    User user = userRepository.findByUsername(AuthUtils.getAuthUserName());
    IdentityVerification identityVerification = new IdentityVerification(user.getId(), user.getTel(), user.getFullName());

    identityVerification.sendAuthNumberWithSMS();
    identityVerificationRepository.save(identityVerification);

    Map<String, Object> result = new HashMap<>();
    result.put("identityVerificationId", identityVerification.getId());
    return ResponseEntity.ok(result);
  }

  @GetMapping(value = "/identity-verification")
  public ResponseEntity<?> checkIdentityVerificationByAuthenticationNumber(@RequestParam(value = "identityVerificationId") Long identityVerificationId,
                                                @RequestParam(value = "receivedAuthenticationNumber") String receivedAuthenticationNumber) {
    IdentityVerification identityVerification = identityVerificationRepository.findOne(identityVerificationId);
    boolean verified = identityVerification.verifyAuthNumber(receivedAuthenticationNumber);
    identityVerificationRepository.save(identityVerification);

    Map<String, Object> result = new HashMap<>();
    result.put("verified", verified);
    return ResponseEntity.ok(result);
  }

  @PostMapping(value = "/encryption-or-decryption")
  public ResponseEntity<?> encryptOrDecrypt(@RequestBody CipherRequest cipherRequest) {
    IdentityVerification identityVerification = identityVerificationRepository.findOne(cipherRequest.getIdentityVerificationId());
    if(identityVerification.getVerified() == false) {
      throw new MetatronException("identity verification error");
    }

    String csvBaseDir = workbenchProperties.getTempCSVPath();
    if(!csvBaseDir.endsWith(File.separator)){
      csvBaseDir = csvBaseDir + File.separator;
    }

    ImsiCipher cipher = new ImsiCipher(cipherRequest.getCipherType(), csvBaseDir, cipherRequest.getCsvFile(), cipherRequest.getFields(), cipherRequest.getCipherFieldName());
    List<Map<String, Object>> data = cipher.encryptOrDecrypt();
    String csvFileName = cipher.writeToCSV(data);

    Map<String, Object> result = new HashMap<>();
    result.put("fields", cipherRequest.getFields());
    result.put("data", data);
    result.put("csvFileName", csvFileName);

    return ResponseEntity.ok(result);
  }

  @PostMapping(path = "/encryption-or-decryption/download")
  public void download(@RequestBody Map<String, Object> requestBody, HttpServletResponse response) throws IOException {
    final String fileName = (String)requestBody.get("fileName");
    String csvBaseDir = workbenchProperties.getTempCSVPath();
    if(!csvBaseDir.endsWith(File.separator)){
      csvBaseDir = csvBaseDir + File.separator;
    }

    final String csvFilePath = csvBaseDir + fileName;
    HttpUtils.downloadCSVFile(response, fileName, csvFilePath, "text/csv; charset=utf-8");
  }
}
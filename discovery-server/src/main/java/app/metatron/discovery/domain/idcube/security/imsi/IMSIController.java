package app.metatron.discovery.domain.idcube.security.imsi;

import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.idcube.security.imsi.dto.CipherRequest;
import app.metatron.discovery.domain.idcube.security.imsi.entity.IdentityVerification;
import app.metatron.discovery.domain.idcube.security.imsi.repository.IdentityVerificationRepository;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.workbench.QueryEditor;
import app.metatron.discovery.domain.workbench.QueryEditorRepository;
import app.metatron.discovery.domain.workbench.QueryEditorResult;
import app.metatron.discovery.domain.workbench.WorkbenchProperties;
import app.metatron.discovery.domain.workspace.BookAuditLogService;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.HttpUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/idcube/imsi")
public class IMSIController {
  private static Logger LOGGER = LoggerFactory.getLogger(IMSIController.class);

  private UserRepository userRepository;

  private IdentityVerificationRepository identityVerificationRepository;

  private QueryEditorRepository queryEditorRepository;

  private BookAuditLogService bookAuditLogService;

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

  @Autowired
  public void setQueryEditorRepository(QueryEditorRepository queryEditorRepository) {
    this.queryEditorRepository = queryEditorRepository;
  }

  @Autowired
  public void setBookAuditLogService(BookAuditLogService bookAuditLogService) {
    this.bookAuditLogService = bookAuditLogService;
  }

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

    final String queryEditorId = (String)requestBody.get("queryEditorId");
    final String originalFileName = (String)requestBody.get("originalFileName");
    final String transformFileName = (String)requestBody.get("transformFileName");


    String csvBaseDir = workbenchProperties.getTempCSVPath();
    if(!csvBaseDir.endsWith(File.separator)){
      csvBaseDir = csvBaseDir + File.separator;
    }

    final String csvFilePath = csvBaseDir + transformFileName;
    HttpUtils.downloadCSVFile(response, transformFileName, csvFilePath, "text/csv; charset=utf-8");
    try {
      logDataDownloadHistory(queryEditorId, originalFileName);
    } catch (Exception e) {
      LOGGER.error("error Logging workspace audit logs for data downloads from workbenches and workbook", e);
    }
  }

  private void logDataDownloadHistory(String queryEditorId, String csvFilePath) {
    QueryEditor queryEditor = queryEditorRepository.findOne(queryEditorId);
    if(queryEditor == null){
      throw new ResourceNotFoundException("QueryEditor(" + queryEditorId + ")");
    }

    Optional<QueryEditorResult> queryResult = queryEditor.getQueryResults().stream()
        .filter(result -> result.getFilePath().equalsIgnoreCase(csvFilePath))
        .findFirst();

    if(queryResult.isPresent()) {
      bookAuditLogService.logDataDownload("workbench", queryEditor.getWorkbench().getId(), "(T-PANI Data Encryption Decryption)" + queryResult.get().getQuery());
    }
  }
}
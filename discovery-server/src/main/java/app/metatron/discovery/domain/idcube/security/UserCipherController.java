package app.metatron.discovery.domain.idcube.security;

import com.sk.idcube.common.security.AccountInfoSecurity;
import com.sk.idcube.common.security.IDCubeSecurity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserCipherController {

  @PostMapping(value = "/api/idcube/user-cipher/decrypt")
  public ResponseEntity<?> decryptUserInformation(@RequestBody List<UserInformation> userInformationList) {
    try {
      IDCubeSecurity security = new AccountInfoSecurity();
      userInformationList.forEach(userInformation -> userInformation.decrypt(security));

      return ResponseEntity.ok(userInformationList);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}

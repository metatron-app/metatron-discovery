package app.metatron.discovery.domain.idcube.security;

import org.junit.Test;

import static org.junit.Assert.*;

public class AESTest {

  @Test
  public void test() {
    final String secretKey = "ssshhhhhhhhhhh!!!!";

    String originalString = "1111222";
//    String encryptedString = AES.encrypt(originalString, secretKey) ;


    String decryptedString = AES.decrypt("dsad!23132Xssss==", secretKey) ;

    System.out.println(originalString);
//    System.out.println(encryptedString + "len:" + encryptedString.length());
    System.out.println(decryptedString);

  }

}
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

package app.metatron.discovery;

import org.apache.catalina.connector.Connector;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.embedded.EmbeddedServletContainerFactory;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.context.annotation.Bean;

import app.metatron.discovery.config.MainApplicationConfig;

/**
 * metatron Discovery Application
 */
@SpringBootApplication(scanBasePackageClasses = {MainApplicationConfig.class})
public class MetatronDiscoveryApplication { //extends SpringBootServletInitializer {

  @Value("${server.tomcat.ajp.enabled}")
  boolean tomcatAjpEnabled;

  @Value("${server.tomcat.ajp.protocol}")
  String ajpProtocol;

  @Value("${server.tomcat.ajp.port}")
  int ajpPort;

  @Bean
  public EmbeddedServletContainerFactory servletContainer() {
    TomcatEmbeddedServletContainerFactory tomcat = new TomcatEmbeddedServletContainerFactory();
    if (tomcatAjpEnabled) {
      Connector ajpConnector = new Connector(ajpProtocol);
      ajpConnector.setPort(ajpPort);
      ajpConnector.setSecure(false);
      ajpConnector.setAllowTrace(false);
      ajpConnector.setScheme("http");
      tomcat.addAdditionalTomcatConnectors(ajpConnector);
    }

    return tomcat;
  }

  public static void main(String[] args) throws Exception {

    // Set Default JVM properties
    System.setProperty("java.net.preferIPv4Stack", "true");
    System.setProperty("file.encoding", "UTF-8");
    System.setProperty("user.timezone", "UTC");

    // Print loaded class list
//    ClassLoader cl = ClassLoader.getSystemClassLoader();
//
//    URL[] urls = ((URLClassLoader)cl).getURLs();
//    int i = 0;
//    for(URL url: urls){
//      System.out.println(i + url.getFile());
//      i++;
//    }

    SpringApplication.run(MetatronDiscoveryApplication.class, args);
  }

}

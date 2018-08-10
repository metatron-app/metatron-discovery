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

import org.junit.Test;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring4.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

/**
 * Created by kyungtaak on 2016. 11. 6..
 */
public class ThymeleafTemplateProcessorTest {

  TemplateEngine templateEngine;

  @Test
  public void setUp() {
    ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
    resolver.setPrefix("templates/api/");
    resolver.setSuffix(".html");
    resolver.setTemplateMode(TemplateMode.HTML);
    resolver.setCharacterEncoding("UTF8");

    templateEngine = new SpringTemplateEngine();
    templateEngine.setTemplateResolver(resolver);
  }

  @Test
  public void formatToResponseEntity() throws Exception {

    ThymeleafTemplateProcessor converter = new ThymeleafTemplateProcessor();
    converter.setTemplateEngine(templateEngine);

    Context context = new Context();
//      Context context = new Context(locale);
    context.setVariable("pageId", "abc");
    context.setVariable("_resource", "/app");
    converter.formatToResponseEntity("page_embedded", context);

  }

}

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

package app.metatron.discovery.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.core.Version;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.hibernate5.Hibernate5Module;
import com.fasterxml.jackson.datatype.joda.JodaModule;

import de.codecentric.boot.admin.jackson.ApplicationDeserializer;
import de.codecentric.boot.admin.model.Application;

import org.pf4j.PluginManager;
import org.pf4j.PluginWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowire;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.data.projection.SpelAwareProxyProjectionFactory;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurerAdapter;
import org.springframework.data.rest.webmvc.config.RepositoryRestMvcConfiguration;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Controller;
import org.springframework.util.ClassUtils;
import org.springframework.web.accept.ContentNegotiationManager;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.ContentNegotiatingViewResolver;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring4.SpringTemplateEngine;
import org.thymeleaf.spring4.templateresolver.SpringResourceTemplateResolver;
import org.thymeleaf.spring4.view.ThymeleafView;
import org.thymeleaf.spring4.view.ThymeleafViewResolver;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

import java.nio.charset.Charset;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import app.metatron.discovery.MetatronDiscoveryApplication;
import app.metatron.discovery.common.MetatronProperties;
import app.metatron.discovery.domain.comment.Comment;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionEventHandler;
import app.metatron.discovery.domain.dataprep.entity.PrDataflow;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.entity.PrTransformRule;
import app.metatron.discovery.domain.dataprep.service.PrDataflowEventHandler;
import app.metatron.discovery.domain.dataprep.service.PrDatasetEventHandler;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceAlias;
import app.metatron.discovery.domain.datasource.DataSourceEventHandler;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.mdm.CodeTable;
import app.metatron.discovery.domain.mdm.CodeValuePair;
import app.metatron.discovery.domain.mdm.ColumnDictionary;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataEventHandler;
import app.metatron.discovery.domain.mdm.catalog.Catalog;
import app.metatron.discovery.domain.mdm.catalog.CatalogEventHandler;
import app.metatron.discovery.domain.notebook.Notebook;
import app.metatron.discovery.domain.notebook.NotebookAPI;
import app.metatron.discovery.domain.notebook.NotebookConnector;
import app.metatron.discovery.domain.notebook.NotebookConnectorEventHandler;
import app.metatron.discovery.domain.notebook.NotebookEventHandler;
import app.metatron.discovery.domain.notebook.NotebookModel;
import app.metatron.discovery.domain.notebook.NotebookModelEventHandler;
import app.metatron.discovery.domain.notebook.NotebookModelHistory;
import app.metatron.discovery.domain.notebook.connector.JupyterConnector;
import app.metatron.discovery.domain.notebook.connector.ZeppelinConnector;
import app.metatron.discovery.domain.tag.Tag;
import app.metatron.discovery.domain.tag.TagDomain;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserEventHandler;
import app.metatron.discovery.domain.user.role.Role;
import app.metatron.discovery.domain.user.role.RoleEventHandler;
import app.metatron.discovery.domain.user.role.RoleSet;
import app.metatron.discovery.domain.user.role.RoleSetEventHandler;
import app.metatron.discovery.domain.workbench.QueryEditor;
import app.metatron.discovery.domain.workbench.QueryHistory;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workbench.WorkbenchEventHandler;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.DashBoardEventHandler;
import app.metatron.discovery.domain.workbook.WorkBook;
import app.metatron.discovery.domain.workbook.WorkBookEventHandler;
import app.metatron.discovery.domain.workbook.widget.FilterWidget;
import app.metatron.discovery.domain.workbook.widget.PageWidget;
import app.metatron.discovery.domain.workbook.widget.TextWidget;
import app.metatron.discovery.domain.workbook.widget.Widget;
import app.metatron.discovery.domain.workbook.widget.WidgetEventHandler;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspaceEventHandler;
import app.metatron.discovery.domain.workspace.folder.Folder;
import app.metatron.discovery.domain.workspace.folder.FolderEventHandler;

import static com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_NON_NUMERIC_NUMBERS;
import static com.fasterxml.jackson.core.JsonParser.Feature.ALLOW_SINGLE_QUOTES;
import static java.util.Optional.ofNullable;

@Configuration
@Import(RepositoryRestMvcConfiguration.class)
@EnableWebMvc
public class ApiResourceConfig extends WebMvcConfigurerAdapter {

  private static Logger LOGGER = LoggerFactory.getLogger(ApiResourceConfig.class);

  private static final String RESOURCE_PATH = "/resource/";
  private static final String COMMON_JS = RESOURCE_PATH + "common.*.js";
  private static final String RUNTIME_JS = RESOURCE_PATH + "runtime.*.js";
  private static final String MAIN_JS = RESOURCE_PATH + "main.*.js";
  private static final String POLYFILLS_JS = RESOURCE_PATH + "polyfills.*.js";
  private static final String SCRIPTS_JS = RESOURCE_PATH + "scripts.*.js";
  private static final String OTHER_JS = RESOURCE_PATH + "*.*.js";

  private static final String STYLES_CSS = RESOURCE_PATH + "styles.*.css";

  private static final String PNG = RESOURCE_PATH + "*.*.png";
  private static final String JPG = RESOURCE_PATH + "*.*.jpg";
  private static final String WOFF = RESOURCE_PATH + "*.*.woff";
  private static final String EOF = RESOURCE_PATH + "*.*.eot";
  private static final String TTF = RESOURCE_PATH + "*.*.ttf";

  public final static String APP_UI_ROUTE_PREFIX = "/app/v2/";
  public final static String API_PREFIX = "/api";
  public final static String REDIRECT_URL = "redirect:" + APP_UI_ROUTE_PREFIX + "index.html";
  public final static String REDIRECT_PATH_URL = REDIRECT_URL + "?path=";

  @Autowired
  MetatronProperties metatronProperties;

  @Autowired
  PluginManager pluginManager;

  @Value("${polaris.resources.cache.cacheControl.max-age: 604800}")
  private Integer cacheControlMaxAge;

  /**
   * Maps all AngularJS routes to index so that they work with direct linking.
   */
  @Controller
  static class Routes {

    @RequestMapping({
        "/"
    })
    public String index() {
      return REDIRECT_URL;
    }
  }

  /**
   *
   */
  @Controller
  @RequestMapping("/api")
  static class ApiRoutes {

    @RequestMapping({
        "/browser"
    })
    public String index() {
      return "redirect:/api/browser/browser.html";
    }
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {

    registry.addResourceHandler("/resource/**")
            .addResourceLocations("classpath:resource/");

    ofNullable(cacheControlMaxAge).ifPresent(value -> {
      try {
        registry.addResourceHandler(COMMON_JS, RUNTIME_JS, MAIN_JS, POLYFILLS_JS, SCRIPTS_JS, OTHER_JS, STYLES_CSS, PNG, JPG, WOFF, EOF, TTF)
                .addResourceLocations("classpath:resource/")
                .setCacheControl(CacheControl.maxAge(value, TimeUnit.SECONDS).cachePublic());
      } catch (Exception e) {
        LOGGER.debug("Please check the value of \"polaris.resources.cache.cacheControl.max-age\" in application.yaml. Resource caching is not enabled.");
      }
    });

    registry.addResourceHandler("/docs/**")
            .addResourceLocations("classpath:resource/docs/");
    registry.addResourceHandler("/assets/**")
            .addResourceLocations("classpath:resource/assets/");
    registry.addResourceHandler("/webjars/**")
            .addResourceLocations("classpath:/META-INF/resources/webjars/");

    //add resource for extension
    // /plugins/plugin-id/**  -->  file:/plugin-path/classes/
    for (PluginWrapper pluginWrapper : pluginManager.getResolvedPlugins()) {
      registry.addResourceHandler("/extensions/" + pluginWrapper.getPluginId() + "/**")
              .addResourceLocations("file:" + pluginWrapper.getPluginPath().toAbsolutePath().toString() + "/classes/");
    }
  }

  @Override
  public void addViewControllers(ViewControllerRegistry registry) {
    registry.addViewController("/app/v2/assets/i18n/en.json").setViewName("forward:/resource/assets/i18n/en.json");
    registry.addViewController("/app/v2/assets/i18n/ko.json").setViewName("forward:/resource/assets/i18n/ko.json");
    registry.addViewController("/app/v2/assets/i18n/zh.json").setViewName("forward:/resource/assets/i18n/zh.json");
    //        registry.addViewController("/app/v2/assets/images/img_photo.png").setViewName("forward:/resource/assets/images/img_photo.png");
    //        registry.addViewController("/assets/**").setViewName("forward:/resource/index.html");
    registry.addViewController("/app/**").setViewName("forward:/resource/index.html");
    registry.addViewController("/app/v2/**").setViewName("forward:/resource/index.html");
  }

  @Bean
  public ViewResolver setupViewResolver(ContentNegotiationManager manager) {
    List<ViewResolver> viewResolvers = new ArrayList<>();
    viewResolvers.add(thymeleafViewResolver());
    ContentNegotiatingViewResolver resolver = new ContentNegotiatingViewResolver();
    resolver.setViewResolvers(viewResolvers);
    resolver.setContentNegotiationManager(manager);
    return resolver;
  }

  @Bean
  public ThymeleafViewResolver thymeleafViewResolver() {
    ThymeleafViewResolver viewResolver = new ThymeleafViewResolver();
    viewResolver.setViewClass(ThymeleafView.class);
    viewResolver.setTemplateEngine(templateEngine());
    viewResolver.setCharacterEncoding("UTF-8");

    return viewResolver;
  }

  @Bean
  public ITemplateResolver servletTemplateResolver() {
    SpringResourceTemplateResolver resolver = new SpringResourceTemplateResolver();
    resolver.setPrefix("/WEB-INF/classes/templates/");
    resolver.setSuffix(".html");
    resolver.setTemplateMode(TemplateMode.HTML);
    resolver.setCharacterEncoding("UTF8");
    resolver.setOrder(2);

    return resolver;
  }

  @Bean
  public ITemplateResolver classLoaderTemplateResolver() {
    ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
    resolver.setPrefix("templates/api/");
    resolver.setSuffix(".html");
    resolver.setTemplateMode(TemplateMode.HTML);
    resolver.setCharacterEncoding("UTF8");
    resolver.setOrder(1);

    return resolver;
  }

  @Bean
  public TemplateEngine templateEngine() {
    SpringTemplateEngine templateEngine = new SpringTemplateEngine();
    templateEngine.setEnableSpringELCompiler(true);
    templateEngine.addTemplateResolver(classLoaderTemplateResolver());
    templateEngine.addTemplateResolver(servletTemplateResolver());
    return templateEngine;
  }

  @Override
  public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
    configurer.enable("default");
  }

  @Override
  public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
    converters.add(mappingJackson2HttpMessageConverter());
    converters.add(stringHttpMessageConverter());
    converters.add(byteArrayHttpMessageConverter());
  }

  @Bean("mappingJackson2HttpMessageConverter")
  public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
    final MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
    converter.setObjectMapper(jacksonBuilder().build());
    return converter;
  }

  @Bean
  public StringHttpMessageConverter stringHttpMessageConverter() {
    final StringHttpMessageConverter stringConverter = new StringHttpMessageConverter(Charset.forName("UTF-8"));
    stringConverter.setSupportedMediaTypes(
        Arrays.asList(MediaType.TEXT_PLAIN, MediaType.TEXT_HTML, MediaType.APPLICATION_JSON));
    return stringConverter;
  }

  @Bean
  public ByteArrayHttpMessageConverter byteArrayHttpMessageConverter() {
    final ByteArrayHttpMessageConverter byteArrayHttpMessageConverter = new ByteArrayHttpMessageConverter();
    byteArrayHttpMessageConverter.setSupportedMediaTypes(Arrays.asList(
        MediaType.IMAGE_JPEG, MediaType.IMAGE_PNG, MediaType.IMAGE_GIF, MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL
    ));

    return byteArrayHttpMessageConverter;
  }

  @Bean
  public Jackson2ObjectMapperBuilder jacksonBuilder() {
    Jackson2ObjectMapperBuilder builder = Jackson2ObjectMapperBuilder.json();

    //add deserializer for managements
    SimpleModule simpleModule = new SimpleModule("SimpleModule", Version.unknownVersion());
    simpleModule.addDeserializer(Application.class, new ApplicationDeserializer());

    Hibernate5Module hibernate5Module = new Hibernate5Module();
    hibernate5Module.disable(Hibernate5Module.Feature.USE_TRANSIENT_ANNOTATION);

    builder.indentOutput(false)
           .dateFormat(new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ"))
           .failOnUnknownProperties(false)
           .featuresToEnable(ALLOW_NON_NUMERIC_NUMBERS)
           .featuresToEnable(ALLOW_SINGLE_QUOTES)
           .serializationInclusion(JsonInclude.Include.NON_NULL)
           .modules(new JodaModule(), hibernate5Module, simpleModule);
    return builder;
  }

  // TODO: 향후 Spring data rest 관련 설정 파일 분리
  @Bean
  public SpelAwareProxyProjectionFactory projectionFactory() {
    return new SpelAwareProxyProjectionFactory();
  }

  @Bean
  public RepositoryRestConfigurer repositoryRestConfigurer() {

    return new RepositoryRestConfigurerAdapter() {

      @Override
      public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config) {
        config.setBasePath(API_PREFIX);
        config.setMaxPageSize(5000);

        // 리턴되는 결과 값내 ID 항목을 표시할 Entity 정보 기록
        config.exposeIdsFor(Workspace.class, WorkBook.class, DashBoard.class, Widget.class,
                            DataSource.class, Field.class, DataSourceAlias.class, IngestionHistory.class,
                            DataConnection.class,
                            Notebook.class, Workbench.class, Folder.class, NotebookModel.class, NotebookModelHistory.class, NotebookAPI.class,
                            Widget.class, PageWidget.class, TextWidget.class, FilterWidget.class,
                            QueryEditor.class, QueryHistory.class,
                            Comment.class,
                            PrDataflow.class, PrDataset.class, PrTransformRule.class,
                            NotebookConnector.class, ZeppelinConnector.class, JupyterConnector.class,
                            User.class, Role.class, RoleSet.class,
                            Metadata.class, Catalog.class,
                            ColumnDictionary.class, CodeTable.class, CodeValuePair.class,
                            Tag.class, TagDomain.class);
      }

      /**
       *  Spring Data Rest 호출시 사용하는 ObjectMapper 설정 수행
       *  기본설정은 RepositoryRestMvcConfiguration.basicObjectMapper() 참조
       * @param objectMapper
       */
      @Override
      public void configureJacksonObjectMapper(ObjectMapper objectMapper) {
        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        objectMapper.configure(ALLOW_NON_NUMERIC_NUMBERS, true);
        objectMapper.configure(ALLOW_SINGLE_QUOTES, true);
        objectMapper.disable(SerializationFeature.INDENT_OUTPUT);
        //                objectMapper.addMixIn(Object.class, IgnoreHibernatePropertiesInJackson.class);
        objectMapper.registerModule(new JodaModule());
        objectMapper.registerModule(new Hibernate5Module());

        ClassPathScanningCandidateComponentProvider provider = new ClassPathScanningCandidateComponentProvider(false);
        provider.addIncludeFilter(new AnnotationTypeFilter(JsonTypeName.class));
        for (BeanDefinition candidate : provider.findCandidateComponents(MetatronDiscoveryApplication.class.getPackage().getName())) {
          objectMapper.registerSubtypes(ClassUtils.resolveClassName(candidate.getBeanClassName(), ClassUtils.getDefaultClassLoader()));
        }

      }

      @Override
      public void configureHttpMessageConverters(List<HttpMessageConverter<?>> messageConverters) {
        messageConverters.add(mappingJackson2HttpMessageConverter());
        messageConverters.add(stringHttpMessageConverter());
        messageConverters.add(byteArrayHttpMessageConverter());
      }

    };
  }

  //    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
  //    private abstract class IgnoreHibernatePropertiesInJackson{ }

  @Bean(autowire = Autowire.BY_TYPE)
  public DataSourceEventHandler dataSourceEventHandler() {
    return new DataSourceEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public DataConnectionEventHandler dataConnectionEventHandler() {
    return new DataConnectionEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public WorkspaceEventHandler workspaceEventHandler() {
    return new WorkspaceEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public WorkBookEventHandler workBookEventHandler() {
    return new WorkBookEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public WorkbenchEventHandler workbenchEventHandler() {
    return new WorkbenchEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public NotebookEventHandler notebookEventHandler() {
    return new NotebookEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public NotebookModelEventHandler notebookModelEventHandler() {
    return new NotebookModelEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public NotebookConnectorEventHandler notebookConnectorEventHandler() {
    return new NotebookConnectorEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public FolderEventHandler folderEventHandler() {
    return new FolderEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public WidgetEventHandler widgetEventHandler() {
    return new WidgetEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public DashBoardEventHandler dashBoardEventHandler() {
    return new DashBoardEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public UserEventHandler userEventHandler() {
    return new UserEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public RoleEventHandler roleEventHandler() {
    return new RoleEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public RoleSetEventHandler roleSetEventHandler() {
    return new RoleSetEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public MetadataEventHandler metadataEventHandler() {
    return new MetadataEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public CatalogEventHandler catalogEventHandler() {
    return new CatalogEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public PrDataflowEventHandler prepDataflowEventHandler() {
    return new PrDataflowEventHandler();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public PrDatasetEventHandler prDatasetEventHandler() {
    return new PrDatasetEventHandler();
  }

  //    @Override
  //    public void addResourceHandlers(ResourceHandlerRegistry registry) {
  //        registry.addResourceHandler("/spread/**").addResourceLocations("classpath:spread/");
  //        registry.addResourceHandler("/favicon.ico").addResourceLocations("classpath:static/favicon.ico");
  //        registry.addResourceHandler(APP_UI_ROUTE_PREFIX + "**/*.*").addResourceLocations("classpath:static/");
  //        registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");
  //        registry.addResourceHandler("/api/browser/**").addResourceLocations("classpath:/META-INF/resources/webjars/discovery-api-browser/");
  //    }

  //    @Override
  //    public void addViewControllers(ViewControllerRegistry registry) {
  ////    registry.addViewController("/").setViewName("redirect:/app/station");
  ////    registry.addViewController("/").setViewName("forward:/app/workspace");
  //        super.addViewControllers(registry);
  //    }

  @Override
  public void addCorsMappings(CorsRegistry registry) {

    //        List<MetatronProperties.Cors> corss = metatronProperties.getCors();
    //
    //        if(corss.isEmpty()) {
    //           registry.addMapping("/**");
    //        } else {
    //            for (MetatronProperties.Cors cors : corss) {
    //                registry
    //                    .addMapping(cors.getMapping())
    //                    .allowedOrigins(cors.getAllowedOrigins())
    //                    .allowedHeaders(cors.getAllowedHeaders())
    //                    .exposedHeaders(cors.getExposedHeaders())
    //                    .allowedMethods(cors.getAllowedMethods())
    //                    .allowCredentials(cors.getAllowCredentials())
    //                    .maxAge(cors.getMaxAge());
    //            }
    //        }

    registry
        .addMapping("/**")
        .allowedOrigins("*")
        .allowedMethods("*")
        .allowedHeaders("*")
        .exposedHeaders("Access-Control-Allow-Origin",
                        "Access-Control-Allow-Methods",
                        "Access-Control-Allow-Headers",
                        "Access-Control-Max-Age",
                        "Access-Control-Request-Headers",
                        "Access-Control-Request-Method");
  }

}

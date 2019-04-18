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

package app.metatron.discovery.extensions;

import org.pf4j.DefaultPluginClasspath;
import org.pf4j.DefaultPluginManager;
import org.pf4j.DevelopmentPluginClasspath;
import org.pf4j.PluginClasspath;
import org.pf4j.PluginStatusProvider;
import org.pf4j.PluginWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.support.AbstractAutowireCapableBeanFactory;
import org.springframework.boot.ApplicationHome;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.Vector;

import javax.annotation.PostConstruct;

import app.metatron.discovery.MetatronDiscoveryApplication;
import app.metatron.discovery.domain.extension.ExtensionProperties;

/**
 */
@Component("pluginManager")
public class CustomPluginManager extends DefaultPluginManager {

  private static final Logger LOGGER = LoggerFactory.getLogger(CustomPluginManager.class);

  @Autowired
  ExtensionProperties extensionProperties;

  @Autowired
  AbstractAutowireCapableBeanFactory beanFactory;

  protected CustomPluginStatusProvider pluginStatusProvider;

  @Override
  protected PluginStatusProvider createPluginStatusProvider() {
    pluginStatusProvider = new CustomPluginStatusProvider();
    return pluginStatusProvider;
  }

  public void injectExtensions() {
    // add extensions from classpath (non plugin)
    Set<String> extensionClassNames = this.getExtensionClassNames(null);
    for (String extensionClassName : extensionClassNames) {
      try {
        LOGGER.debug("Register extension '{}' as bean", extensionClassName);
        Class<?> extensionClass = getClass().getClassLoader().loadClass(extensionClassName);
        registerExtension(extensionClass);
      } catch (ClassNotFoundException e) {
        LOGGER.error(e.getMessage(), e);
      }
    }

    // add extensions for each started plugin
    List<PluginWrapper> startedPlugins = this.getStartedPlugins();
    for (PluginWrapper plugin : startedPlugins) {
      LOGGER.debug("Registering extensions of the plugin '{}' as beans", plugin.getPluginId());
      extensionClassNames = this.getExtensionClassNames(plugin.getPluginId());
      for (String extensionClassName : extensionClassNames) {
        try {
          LOGGER.debug("Register extension '{}' as bean", extensionClassName);
          Class<?> extensionClass = plugin.getPluginClassLoader().loadClass(extensionClassName);
          registerExtension(extensionClass);
        } catch (ClassNotFoundException e) {
          LOGGER.error(e.getMessage(), e);
        }
      }
    }
  }

  /**
   * Register an extension as bean.
   * Current implementation register extension as singleton using {@code beanFactory.registerSingleton()}.
   * The extension instance is created using {@code pluginManager.getExtensionFactory().create(extensionClass)}.
   * The bean name is the extension class name.
   * Override this method if you wish other register strategy.
   */
  protected void registerExtension(Class<?> extensionClass) {
    Object extension = this.getExtensionFactory().create(extensionClass);
    beanFactory.registerSingleton(extension.getClass().getName(), extension);
  }

  @Override
  protected Path createPluginsRoot() {
    LOGGER.info("Plugin RuntimeMode :  = " + getRuntimeMode());
    String pluginsDir = System.getProperty("pf4j.pluginsDir");
    if (pluginsDir == null) {
      if (isDevelopment()) {
        pluginsDir = "./discovery-distribution/extensions";
      } else {
        ApplicationHome home = new ApplicationHome(MetatronDiscoveryApplication.class);
        LOGGER.info("Application Home : " + home.getDir().getAbsolutePath());
        pluginsDir = home.getDir().getAbsolutePath() + "/extensions";
      }
    }

    Path pluginPath = Paths.get(pluginsDir);
    LOGGER.info("PluginPath : " + pluginPath.toAbsolutePath().toString());
    return pluginPath;
  }

  @Override
  protected PluginClasspath createPluginClasspath() {
    return new DefaultPluginClasspath();
  }

  @PostConstruct
  public void postConstruct(){
    super.initialize();

    //initialize pluginStatusProvider before load plugins
    pluginStatusProvider.initialize(extensionProperties);

    this.loadPlugins();

    this.startPlugins();

    this.injectExtensions();
  }
}

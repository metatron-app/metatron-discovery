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

package app.metatron.discovery.common.web;

import app.metatron.discovery.common.CommonLocalVariable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

/**
 * Created by kyungtaak on 2016. 11. 20..
 */
public class CommonLocalVariableFilter implements Filter {

  private static Logger LOGGER = LoggerFactory.getLogger(CommonLocalVariableFilter.class);

  @Override
  public void init(FilterConfig filterConfig) throws ServletException {

  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

    String url = null;
    String queryString = null;
    if (request instanceof HttpServletRequest) {
      url = ((HttpServletRequest)request).getRequestURL().toString();
      queryString = ((HttpServletRequest)request).getQueryString();
    }

    CommonLocalVariable.getLocalVariable();
    LOGGER.debug("Init local variable at {}{}",
        url == null ? "" : url,
        queryString == null ? "" : "?" + queryString);

    chain.doFilter(request, response);

    CommonLocalVariable.remove();
    LOGGER.debug("Clear local variable at {}{}",
        url == null ? "" : url,
        queryString == null ? "" : "?" + queryString);
  }

  @Override
  public void destroy() {

  }
}

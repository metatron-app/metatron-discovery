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

package app.metatron.discovery.query.druid.filters;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.query.druid.Filter;

@JsonTypeName("bound")
public class RangeFilter implements Filter {
	String dimension;
	String upper;
	String lower;
	boolean alphaNumeric;

	public RangeFilter(){
		
	}
	
	public RangeFilter(String dimension, String upper, String lower, boolean alphaNumeric) {
		  this.dimension = dimension;
		  this.upper = upper;
		  this.lower = lower;
		  this.alphaNumeric = alphaNumeric;
	}

	public String getDimension() {
		return dimension;
	}

	public void setDimension(String dimension) {
		this.dimension = dimension;
	}

	public String getUpper() {
		return upper;
	}

	public void setUpper(String upper) {
		this.upper = upper;
	}

	public String getLower() {
		return lower;
	}

	public void setLower(String lower) {
		this.lower = lower;
	}

	public boolean isAlphaNumeric() {
		return this.alphaNumeric;
	}

	public void setAlphaNumericc(boolean alphaNumeric) {
		this.alphaNumeric = alphaNumeric;
	}
}

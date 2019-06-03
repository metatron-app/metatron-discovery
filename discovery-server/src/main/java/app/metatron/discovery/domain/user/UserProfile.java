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

package app.metatron.discovery.domain.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.security.Principal;

/**
 * Created by kyungtaak on 2016. 5. 18..
 */
@JsonTypeName("user")
public class UserProfile implements DirectoryProfile {

  public static final String UNKNOWN_USERNAME = "Unknown user";

  String username;

  String fullName;

  String email;

  String imageUrl;

  public UserProfile() {
    // Empty Constructor
  }

  public UserProfile(String username, String fullName, String email) {
    this.username = username;
    this.fullName = fullName;
    this.email = email;
  }

  @JsonIgnore
  @Override
  public String getId() {
    return username;
  }

  @JsonIgnore
  @Override
  public String getName() {
    return fullName;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getFullName() {
    return fullName;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }

  public static UserProfile getProfile(User user) {

    if(user == null) {
      return null;
    }

    UserProfile userProfile = new UserProfile();
    userProfile.setUsername(user.getUsername());
    userProfile.setFullName(user.getFullName());
    userProfile.setEmail(user.getEmail());
    userProfile.setImageUrl(user.getImageUrl());

    return userProfile;
  }

  public static UserProfile getProfile(Principal principal) {

    if(principal != null && principal instanceof User) {
      return getProfile((User) principal);
    }

    return null;
  }


}

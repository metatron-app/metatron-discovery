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

package app.metatron.discovery.common.saml;

import org.joda.time.DateTime;
import org.opensaml.saml2.core.Assertion;
import org.opensaml.saml2.core.Attribute;
import org.opensaml.saml2.core.Audience;
import org.opensaml.saml2.core.AudienceRestriction;
import org.opensaml.saml2.core.AuthnStatement;
import org.opensaml.saml2.core.NameID;
import org.opensaml.saml2.core.Subject;
import org.opensaml.saml2.core.SubjectConfirmationData;
import org.opensaml.saml2.core.SubjectLocality;
import org.opensaml.ws.message.encoder.MessageEncodingException;
import org.opensaml.xml.util.XMLHelper;
import org.springframework.security.core.Authentication;
import org.springframework.security.saml.SAMLCredential;
import org.springframework.security.saml.util.SAMLUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SAMLAuthenticationInfo {

  //General
  private General general;

  //Principal's SAML Attributes
  private List<Map> attributes;

  //Subject confirmation
  private SubjectConfirmation subjectConfirmation;

  //Authentication statement
  private AuthenticationStatement authenticationStatement;

  //Conditions
  private Conditions conditions;

  private String assertion;

  public SAMLAuthenticationInfo(Authentication authentication) throws MessageEncodingException{
    SAMLCredential credential = (SAMLCredential) authentication.getCredentials();

    //General
    general = new General(authentication);

    //Principal's SAML Attributes
    attributes = new ArrayList<>();
    for(Attribute attr : credential.getAttributes()){
      Map<String, String> attrMap = new HashMap<>();
      attrMap.put("name", attr.getName());
      attrMap.put("friendlyName", attr.getFriendlyName());
      attrMap.put("value", credential.getAttributeAsString(attr.getName()));
      attributes.add(attrMap);
    }

    //Subject confirmation
    subjectConfirmation = new SubjectConfirmation(authentication);

    //Authentication statement
    authenticationStatement = new AuthenticationStatement(authentication);

    //Conditions
    conditions = new Conditions(authentication);

    //Assertion XML
    assertion = XMLHelper.nodeToString(SAMLUtil.marshallMessage(credential.getAuthenticationAssertion()));
  }

  public General getGeneral() {
    return general;
  }

  public void setGeneral(General general) {
    this.general = general;
  }

  public List<Map> getAttributes() {
    return attributes;
  }

  public void setAttributes(List<Map> attributes) {
    this.attributes = attributes;
  }

  public SubjectConfirmation getSubjectConfirmation() {
    return subjectConfirmation;
  }

  public void setSubjectConfirmation(SubjectConfirmation subjectConfirmation) {
    this.subjectConfirmation = subjectConfirmation;
  }

  public AuthenticationStatement getAuthenticationStatement() {
    return authenticationStatement;
  }

  public void setAuthenticationStatement(AuthenticationStatement authenticationStatement) {
    this.authenticationStatement = authenticationStatement;
  }

  public Conditions getConditions() {
    return conditions;
  }

  public void setConditions(Conditions conditions) {
    this.conditions = conditions;
  }

  public String getAssertion() {
    return assertion;
  }

  public void setAssertion(String assertion) {
    this.assertion = assertion;
  }

  @Override
  public String toString() {
    return "SAMLAuthenticationInfo{" +
            "general=" + general +
            ", attributes=" + attributes +
            ", subjectConfirmation=" + subjectConfirmation +
            ", authenticationStatement=" + authenticationStatement +
            ", conditions=" + conditions +
            ", assertion='" + assertion + '\'' +
            '}';
  }

  public class General{
    private String name;
    private Object principal;
    private String nameId;
    private String nameIdFormat;
    private String idp;
    private DateTime assertionIssueTime;

    public General(Authentication authentication){
      SAMLCredential credential = (SAMLCredential) authentication.getCredentials();
      NameID nameID = credential.getNameID();

      name = authentication.getName();
      principal = authentication.getPrincipal();
      nameId = nameID.getValue();
      nameIdFormat = nameID.getFormat();
      idp = credential.getAuthenticationAssertion().getIssuer().getValue();
      assertionIssueTime = credential.getAuthenticationAssertion().getIssueInstant();
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public Object getPrincipal() {
      return principal;
    }

    public void setPrincipal(Object principal) {
      this.principal = principal;
    }

    public String getNameId() {
      return nameId;
    }

    public void setNameId(String nameId) {
      this.nameId = nameId;
    }

    public String getNameIdFormat() {
      return nameIdFormat;
    }

    public void setNameIdFormat(String nameIdFormat) {
      this.nameIdFormat = nameIdFormat;
    }

    public String getIdp() {
      return idp;
    }

    public void setIdp(String idp) {
      this.idp = idp;
    }

    public DateTime getAssertionIssueTime() {
      return assertionIssueTime;
    }

    public void setAssertionIssueTime(DateTime assertionIssueTime) {
      this.assertionIssueTime = assertionIssueTime;
    }

    @Override
    public String toString() {
      return "General{" +
              "name='" + name + '\'' +
              ", principal=" + principal +
              ", nameId='" + nameId + '\'' +
              ", nameIdFormat='" + nameIdFormat + '\'' +
              ", idp='" + idp + '\'' +
              ", assertionIssueTime=" + assertionIssueTime +
              '}';
    }
  }

  public class SubjectConfirmation{
    private String method;
    private String inResponseTo;
    private DateTime notOnOrAfter;
    private String recipient;

    public SubjectConfirmation(Authentication authentication){
      SAMLCredential credential = (SAMLCredential) authentication.getCredentials();
      Subject subject = credential.getAuthenticationAssertion().getSubject();
      List<org.opensaml.saml2.core.SubjectConfirmation> subjectConfirmations = subject.getSubjectConfirmations();
      org.opensaml.saml2.core.SubjectConfirmation subjectConfirmation = subjectConfirmations.get(0);
      SubjectConfirmationData subjectConfirmationData = subjectConfirmation.getSubjectConfirmationData();

      method = subjectConfirmation.getMethod();
      inResponseTo = subjectConfirmationData.getInResponseTo();
      notOnOrAfter = subjectConfirmationData.getNotOnOrAfter();
      recipient = subjectConfirmationData.getRecipient();
    }

    public String getMethod() {
      return method;
    }

    public void setMethod(String method) {
      this.method = method;
    }

    public String getInResponseTo() {
      return inResponseTo;
    }

    public void setInResponseTo(String inResponseTo) {
      this.inResponseTo = inResponseTo;
    }

    public DateTime getNotOnOrAfter() {
      return notOnOrAfter;
    }

    public void setNotOnOrAfter(DateTime notOnOrAfter) {
      this.notOnOrAfter = notOnOrAfter;
    }

    public String getRecipient() {
      return recipient;
    }

    public void setRecipient(String recipient) {
      this.recipient = recipient;
    }

    @Override
    public String toString() {
      return "SubjectConfirmation{" +
              "method='" + method + '\'' +
              ", inResponseTo='" + inResponseTo + '\'' +
              ", notOnOrAfter=" + notOnOrAfter +
              ", recipient='" + recipient + '\'' +
              '}';
    }
  }

  public class AuthenticationStatement{
    private DateTime authenticationInstance;
    private DateTime sessionValidity;
    private String authenticationContextClass;
    private String sessionIndex;
    private String subjectLocality;

    public AuthenticationStatement(Authentication authentication){
      SAMLCredential credential = (SAMLCredential) authentication.getCredentials();
      Assertion assertion = credential.getAuthenticationAssertion();
      List<AuthnStatement> authnStatements = assertion.getAuthnStatements();
      AuthnStatement authnStatement = authnStatements.get(0);
      SubjectLocality subjectLocalityValue = authnStatement.getSubjectLocality();

      authenticationInstance = authnStatement.getAuthnInstant();
      sessionValidity = authnStatement.getSessionNotOnOrAfter();
      authenticationContextClass = authnStatement.getAuthnContext().getAuthnContextClassRef().getAuthnContextClassRef();
      sessionIndex = authnStatement.getSessionIndex();
      subjectLocality = subjectLocalityValue == null ? null : subjectLocalityValue.getAddress();
    }

    public DateTime getAuthenticationInstance() {
      return authenticationInstance;
    }

    public void setAuthenticationInstance(DateTime authenticationInstance) {
      this.authenticationInstance = authenticationInstance;
    }

    public DateTime getSessionValidity() {
      return sessionValidity;
    }

    public void setSessionValidity(DateTime sessionValidity) {
      this.sessionValidity = sessionValidity;
    }

    public String getAuthenticationContextClass() {
      return authenticationContextClass;
    }

    public void setAuthenticationContextClass(String authenticationContextClass) {
      this.authenticationContextClass = authenticationContextClass;
    }

    public String getSessionIndex() {
      return sessionIndex;
    }

    public void setSessionIndex(String sessionIndex) {
      this.sessionIndex = sessionIndex;
    }

    public String getSubjectLocality() {
      return subjectLocality;
    }

    public void setSubjectLocality(String subjectLocality) {
      this.subjectLocality = subjectLocality;
    }

    @Override
    public String toString() {
      return "AuthenticationStatement{" +
              "authenticationInstance=" + authenticationInstance +
              ", sessionValidity=" + sessionValidity +
              ", authenticationContextClass='" + authenticationContextClass + '\'' +
              ", sessionIndex='" + sessionIndex + '\'' +
              ", subjectLocality='" + subjectLocality + '\'' +
              '}';
    }
  }

  public class Conditions{
    private DateTime notBefore;
    private DateTime notOnOrAfter;
    private List<String> audienceRestriction;

    public Conditions(Authentication authentication){
      SAMLCredential credential = (SAMLCredential) authentication.getCredentials();
      Assertion assertion = credential.getAuthenticationAssertion();
      org.opensaml.saml2.core.Conditions conditions = assertion.getConditions();
      List<AudienceRestriction> audienceRestrictions = conditions.getAudienceRestrictions();
      List<Audience> audiences = audienceRestrictions.get(0).getAudiences();

      notBefore = conditions.getNotBefore();
      notOnOrAfter = conditions.getNotOnOrAfter();
      audienceRestriction = new ArrayList<>();
      for(Audience audience : audiences){
        audienceRestriction.add(audience.getAudienceURI());
      }
    }

    public DateTime getNotBefore() {
      return notBefore;
    }

    public void setNotBefore(DateTime notBefore) {
      this.notBefore = notBefore;
    }

    public DateTime getNotOnOrAfter() {
      return notOnOrAfter;
    }

    public void setNotOnOrAfter(DateTime notOnOrAfter) {
      this.notOnOrAfter = notOnOrAfter;
    }

    public List<String> getAudienceRestriction() {
      return audienceRestriction;
    }

    public void setAudienceRestriction(List<String> audienceRestriction) {
      this.audienceRestriction = audienceRestriction;
    }

    @Override
    public String toString() {
      return "Conditions{" +
              "notBefore=" + notBefore +
              ", notOnOrAfter=" + notOnOrAfter +
              ", audienceRestriction=" + audienceRestriction +
              '}';
    }
  }
}

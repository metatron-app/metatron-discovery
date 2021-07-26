import {UserProfile} from "@domain/user/user-profile";

export class OrganizationMember{
  public id: number;
  // member id
  public memberId: string;
  // member name
  public memberName: string;
  // profile
  public profile: UserProfile;
  // type
  public type: string;
}

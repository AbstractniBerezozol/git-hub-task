import { ApiProperty } from "@nestjs/swagger";
export enum SearchBy {

  name = 'in:name',
  description = 'in:description',
  topics ='in:topics',
  readme = 'in:readme',
  repoOwner='repo:owner/name'
}
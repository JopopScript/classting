export enum DatabaseStatus {
  NO_RESULT = 'DB01',
  NOT_ALLOW_DUPLICATE = 'DB02',
  UNKNOWN = 'DB99'
}

export function getDatabaseStatusMessage(status: DatabaseStatus): string {
  return {
    [DatabaseStatus.NO_RESULT]: '데이터베이스 조회 결과 없음',
    [DatabaseStatus.NOT_ALLOW_DUPLICATE]: '중복된 값을 생성할 수 없습니다.',
    [DatabaseStatus.NO_RESULT]: '데이터베이스 알수없는 에러',
  }[status];
}
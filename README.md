# 클래스팅 백엔드 개발자 과제

## docker를 사용한 구동

- nodejs, mysql등 필요한 라이브러리 설치 없이 도커만 설치하여 구동
- mac 또는 linux
- docker, docker-compose가 설치된 환경

### 구동 테스트 환경

- 하드웨어: macbook m1 pro
- Docker Desktop 버전 4.11.1
- Docker Compose 버전 v2.7.0

### 서버 구동

- localhost:3000/api 로 접속

```bash
# 빌드
docker-compose -f docker-compose.yaml build
# 시작
docker-compose -f docker-compose.yaml up
# 종료
docker-compose -f docker-compose.yaml down

# 필요에 따라 도커이미지 삭제
docker rmi project_app:lates
```

### 단위 테스트 실행

```bash
# 빌드(이미되어있다면 패스)
docker-compose -f docker-compose.yaml build
# 시작 및 테스트후 자동종료
docker-compose -f docker-compose-unit-test.yaml up \
&& docker-compose -f docker-compose-unit-test.yaml rm -fsv
```

### 통합 테스트

```bash
# 빌드(이미되어있다면 패스)
docker-compose -f docker-compose-e2e-test.yaml build
# 시작
docker-compose -f docker-compose-e2e-test.yaml up
# 종료
docker-compose -f docker-compose-e2e-test.yaml down
```

### 기타 명령어

```bash
#코드 수정후 빌드명령을 진행하였지만 캐시를 사용하며 빌드가 진해오디지 않는경우
docker-compose -f docker-compose-e2e-test.yaml build --no-cache

```

## 로컬컴퓨터에서 구동

- nodejs:16 설치
- mysql:8.0.31를 접근 가능한 곳으로 구동
- macbook m1 pro에서 구동 확인

### .env파일 수정

- 아래 내용을 위에서 구동시킨 mysql 접근정보로 수정

```bash
DATABASE_HOST=mysql
DATABASE_PORT=3306
DATABASE_USERNAME=kero
DATABASE_PASSWORD=kero
DATABASE_DATABASENAME=kero
```

### 서버 구동

- localhost:3000/api 로 접속

```bash
# 테이블 생성
typeorm:migration:run
# 테이블 생성에 사용항 migration 디렉토리 이동 - 필수!!
mv ./src/db-migrations ./
# 시작
npm run start
```

### 단위 테스트 실행

```bash
# 테스트 실행
npm run test
# 테스트 실행 + 테스트 커버리지 확인
npm run test:cov
```

### 통합 테스트

```bash
# 실행
npm run test:e2e
```

## api 명세

- 위에 방법으로 서버 구동 후 **localhost:3000/api** 에 접속하여 확인

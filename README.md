# ACTS Backend

## API's
\-

## GIT
### Rules
- 수정(커밋) 내용은 한글로 작성

### Commit mesage
```
Add: 수정 내용
Refactor: 수정 내용
```

## Directory
```
src
 ┣ common              # 공통 유틸, 데코레이터, 가드, 인터셉터
 ┣ config              # 설정, 환경변수
 ┣ modules
 ┃ ┣ auth              # 로그인/로그아웃/소셜 로그인
 ┃ ┣ user              # 회원가입, 사용자 기본 정보
 ┃ ┣ survey            # 설문 모듈
 ┃ ┣ game              # 미니게임/행동 데이터 수집
 ┃ ┣ report            # 진단/종합 리포트
 ┣ app.module.ts
 ┗ main.ts

```
# DadaChat Backend API

DadaChat 서비스의 **백엔드 서버**로,  
Widget과 Dashboard 간 실시간 통신, 인증, 데이터 저장을 담당합니다.

---

## System Overview

DadaChat은 3개의 독립적인 애플리케이션으로 구성됩니다.

- **Widget**: 외부 웹사이트에서 고객 문의 UI 제공
- **Dashboard**: 관리자가 문의를 확인하고 응답
- **Backend API**: 인증, DB 저장, 실시간 메시지 처리

이 레포지토리는 Widget과 Dashboard를 연결하는 **Backend API**를 담당합니다.

---

## Deployment

- Backend URL: https://dadachat-backend.onrender.com
- Supabase 기반 PostgreSQL DB 사용
- Render Free Tier 사용으로 서버 슬립 가능
  - Widget에서 `/health` 호출 시 서버 자동 깨우기 처리

---

## Test Credentials

> 테스트 계정 정보는 Dashboard README 참고

- Dashboard와 Widget 요청 시 인증 필요
- Dashboard 요청 시 JWT 액세스 토큰,  
  Widget 요청 시 Site Key 기반 인증을 사용

---

## Tech Stack

- Node.js + Express
- TypeScript
- Supabase (PostgreSQL) + Prisma ORM
- Socket.io (실시간 통신)
- bcrypt (패스워드 해싱)
- jsonwebtoken (JWT 인증)
- cors, dotenv 등 기본 미들웨어

---

## Key Features

### 1. 인증 및 권한 관리

- JWT 기반 로그인/권한 관리
- 로그인 시 관리자 권한(Role) 포함 토큰 발급
- Dashboard API 접근 제어
- Widget API는 Site Key 기반 인증

### 2. 실시간 채팅 처리

- Socket.io 서버를 통해 Dashboard ↔ Widget 실시간 연결
- 채팅방별 메시지 브로드캐스트 및 상태 관리
- 읽음 처리 로직과 채팅방 구분

### 3. 데이터 저장 및 관리

- PostgreSQL을 Supabase로 관리
- Prisma ORM으로 모델 정의 및 DB 접근
- 저장 항목:
  - 사용자(관리자) 계정
  - 회사 정보
  - 도메인 정보
  - 채팅방 정보
  - 채팅 메시지
  - 메세지 읽음상태 정보
  - 방문자 정보
- 스키마 설계는 확장성 고려 (다중 도메인, 다중 관리자 가능)

---

## Design Decisions

- **Role 기반 접근 제어**: 관리자별 권한 세분화로 Dashboard 기능 안전하게 보호
- **Socket.io 선택 이유**: 실시간 채팅과 미읽음 상태 동기화 최적화
- **Supabase + Prisma 선택 이유**:
  - PostgreSQL 안정성과 ACID 트랜잭션 보장
  - Prisma로 타입 안정성과 생산성 확보
  - 쉽게 확장 가능하고, 포트폴리오 환경에서도 세팅 간편
- **환경변수 관리**: `.env`로 MAIL 계정 및 비밀번호, DB URL, JWT 시크릿 관리
- **서버 슬립 대응**: Free Tier 환경을 고려한 경량화 설계

---

## Current Status

- Dashboard / Widget ↔ Backend 간 기본 통신 및 인증 완료
- 실시간 채팅 및 상태 관리 동작
- 포트폴리오용 MVP 단계

---

## Future Improvements

- 사용자 간의 채팅 기능
- 사용자 알림 로그 기록 등 운영 기능 강화

---

## Note

본 프로젝트는 실제 상용 서비스가 아닌  
**포트폴리오 및 학습 목적**으로 제작되었습니다.

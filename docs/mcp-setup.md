# MCP 연결 가이드

이 문서는 백엔드를 잘 모르는 프론트엔드 개발자가 MCP 연결 상태를 확인하고,
AI agent 엔지니어에게 필요한 정보를 요청할 수 있도록 정리한 문서입니다.

## 지금 상태

현재 이 Next.js 앱은 두 가지 방식으로 동작합니다.

1. MCP 설정이 없으면 기존처럼 샘플 영상을 보여주는 데모 모드로 동작합니다.
2. MCP 설정이 있으면 실제 MCP 서버의 영상 생성 tool을 호출합니다.

쉽게 말하면, 프론트 화면과 API 버튼은 준비되어 있고,
실제 영상 생성 서버에 연결하려면 MCP 서버 정보가 필요합니다.

추가로 이 프로젝트 안에 로컬 테스트용 MCP 서버도 들어 있습니다.

```text
server/mcp-video-server.mjs
```

이 서버는 실제 영상 생성 모델이 아직 없기 때문에 완성된 mp4를 직접 만들지는 않습니다.
대신 MCP 연결 규격을 맞춘 뒤 샘플 영상 URL을 반환합니다.
`OPENAI_API_KEY`가 있으면 GPT를 이용해 프롬프트 분석/영상 기획 정보만 생성합니다.

## MCP가 하는 일

MCP 서버는 실제 작업을 하는 외부 서버입니다.

이 프로젝트에서는 MCP 서버가 아래 일을 해줘야 합니다.

```text
프론트에서 프롬프트 입력
-> Next.js API가 MCP 서버에 요청
-> MCP 서버가 영상 생성 tool 실행
-> jobId, 상태, 영상 URL 반환
-> 프론트에서 결과 표시
```

즉, 프론트는 버튼과 화면이고 MCP 서버는 실제 영상 생성 담당자입니다.

## AI Agent 엔지니어에게 요청할 정보

아래 값을 받아야 실제 연결할 수 있습니다.

```text
MCP 서버 주소:
MCP 연결 방식: streamable-http 또는 sse
인증 토큰 필요 여부:
인증 토큰 값:
영상 생성 tool 이름:
상태 조회 tool 이름:
결과 조회 tool 이름:
요청 request schema:
응답 response schema:
```

가장 중요한 값은 아래 세 가지입니다.

```text
MCP_SERVER_URL
MCP_GENERATE_TOOL
MCP_AUTH_TOKEN
```

토큰이 필요 없는 서버라면 `MCP_AUTH_TOKEN`은 없어도 됩니다.

## 상대방에게 그대로 보낼 문장

아래 문장을 AI agent 엔지니어에게 그대로 보내면 됩니다.

```text
프론트 쪽에는 Next.js API route와 MCP client 연결 코드를 넣어둔 상태입니다.

실제 MCP 서버에 연결하려면 아래 정보가 필요합니다.

1. MCP 서버 URL
2. MCP transport 방식: streamable-http 인지 sse 인지
3. 인증 토큰이 필요한지
4. 필요한 경우 인증 토큰 값
5. 영상 생성 tool 이름
6. 상태 조회 tool 이름
7. 결과 조회 tool 이름
8. generate tool request schema
9. generate/status/result response schema

이 값들을 받으면 프론트 프로젝트의 .env.local에 넣어서 연결 테스트하겠습니다.
```

## .env.local 설정 방법

프로젝트 루트에 `.env.local` 파일을 만들고 아래처럼 넣습니다.

```text
MCP_SERVER_URL=http://127.0.0.1:8787/mcp
MCP_TRANSPORT=streamable-http
MCP_GENERATE_TOOL=generate_video
MCP_STATUS_TOOL=get_video_status
MCP_RESULT_TOOL=get_video_result
MCP_REQUEST_TIMEOUT_MS=60000
```

각 값의 의미는 아래와 같습니다.

```text
MCP_SERVER_URL
MCP 서버 주소입니다.

MCP_TRANSPORT
MCP 서버와 대화하는 방식입니다.
보통 streamable-http 또는 sse 중 하나입니다.

MCP_AUTH_TOKEN
MCP 서버 접속에 필요한 비밀번호 같은 값입니다.
필요 없으면 이 줄은 지워도 됩니다.

MCP_GENERATE_TOOL
영상을 생성하는 MCP tool 이름입니다.

MCP_STATUS_TOOL
영상 생성 진행 상태를 조회하는 MCP tool 이름입니다.
MCP 서버가 비동기 job 방식이 아니면 없을 수도 있습니다.

MCP_RESULT_TOOL
완성된 영상 결과를 조회하는 MCP tool 이름입니다.
MCP 서버가 generate 응답에서 바로 videoUrl을 주면 없을 수도 있습니다.

MCP_REQUEST_TIMEOUT_MS
MCP 요청을 최대 몇 밀리초까지 기다릴지 정하는 값입니다.
60000은 60초입니다.
```

## 로컬 MCP 서버 실행 방법

먼저 MCP 서버를 실행합니다.

```bash
npm run mcp:video
```

정상 실행되면 아래 주소에서 health check를 볼 수 있습니다.

```text
http://127.0.0.1:8787/health
```

그 다음 Next.js 프론트 서버를 별도 터미널에서 실행합니다.

```bash
npm run dev
```

이제 프론트가 `/api/generate`를 호출하면 Next.js API route가 로컬 MCP 서버의
`generate_video` tool을 호출합니다.

## GPT 임시 사용 설정

실제 영상 생성 모델 정보가 아직 없으므로, 현재 GPT는 실제 영상 파일을 만드는 용도가 아닙니다.
GPT는 입력 프롬프트를 보고 아래 같은 영상 기획 정보를 만드는 용도입니다.

```text
concept
camera
lighting
motion
style_tags
```

GPT를 사용하려면 MCP 서버를 실행하는 터미널에 아래 환경변수가 있어야 합니다.

```text
OPENAI_API_KEY=발급받은_OpenAI_API_Key
OPENAI_MODEL=gpt-5.5
```

`OPENAI_API_KEY`가 없으면 GPT 호출 없이 mock 모드로 동작합니다.
`OPENAI_MODEL`은 나중에 실제 사용할 모델명이 정해지면 그 값으로 바꾸면 됩니다.

중요한 점은 아래와 같습니다.

```text
현재 MCP 서버는 연결 테스트용 백엔드입니다.
실제 영상 생성 백엔드는 아직 아닙니다.
실제 LLM 또는 영상 생성 API 정보가 오면 server/mcp-video-server.mjs 안의 provider 부분을 교체하면 됩니다.
```

## 연결 테스트 방법

개발 서버를 실행합니다.

```bash
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```text
http://localhost:3000/api/mcp/tools
```

정상 연결이면 대략 아래처럼 나옵니다.

```json
{
  "configured": true,
  "tools": [
    {
      "name": "generate_video"
    }
  ]
}
```

여기서 `tools` 안에 MCP 서버의 tool 목록이 보이면 연결이 된 것입니다.

## 자주 나오는 결과

아래 결과가 나오면 아직 MCP 설정이 안 된 상태입니다.

```json
{
  "configured": false,
  "message": "MCP_SERVER_URL and MCP_GENERATE_TOOL must be set first."
}
```

이 경우 `.env.local`에 `MCP_SERVER_URL`과 `MCP_GENERATE_TOOL`을 넣어야 합니다.

아래 결과가 나오면 설정값은 있는데 MCP 서버 연결에 실패한 상태입니다.

```json
{
  "configured": true,
  "error": "MCP_TOOLS_FAILED",
  "message": "..."
}
```

이 경우 아래 중 하나가 문제일 가능성이 큽니다.

```text
MCP_SERVER_URL이 틀림
MCP_TRANSPORT가 서버 방식과 다름
MCP_AUTH_TOKEN이 없거나 틀림
MCP 서버가 아직 실행 중이 아님
네트워크 접근이 막힘
```

## 현재 앱의 API 흐름

프론트는 영상을 만들 때 아래 API를 호출합니다.

```text
POST /api/generate
```

이 API는 지금 이렇게 동작합니다.

```text
MCP 설정이 있으면:
  MCP 서버의 영상 생성 tool 호출

MCP 설정이 없으면:
  기존 데모 샘플 영상 반환
```

상태와 결과 조회 API도 있습니다.

```text
GET /api/status/:jobId
GET /api/result/:jobId
```

`MCP_STATUS_TOOL`, `MCP_RESULT_TOOL` 값이 있으면 MCP 서버를 호출하고,
값이 없으면 기존 데모 응답을 반환합니다.

## 현재 상태를 한 문장으로 말하면

```text
프론트에는 MCP client 연결 코드와 API route 연결부가 준비되어 있고,
로컬 테스트용 MCP 서버도 추가되어 있습니다.
다만 실제 영상 생성 모델은 아직 연결되지 않았고, 현재는 GPT 프롬프트 기획 + 샘플 영상 URL 반환 구조입니다.
```

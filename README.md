# VIDEO.AI Demo

프롬프트 기반 영상 생성 데모입니다. Next.js 프론트, Next.js API route, 로컬 MCP 서버가 함께 들어 있습니다.

현재는 실제 영상 생성 모델이 연결된 상태가 아닙니다. MCP 서버와 API 흐름은 실제처럼 구성되어 있고, 영상 결과는 mock 샘플 mp4 URL을 반환합니다. `OPENAI_API_KEY`를 넣으면 GPT는 실제 영상을 만드는 것이 아니라 프롬프트를 분석해 영상 기획 정보를 만드는 용도로만 사용됩니다.

## 현재 상태

```text
완료:
- 프론트 화면
- Next.js API route
- MCP client
- 로컬 MCP 서버
- generate/status/result tool
- status/result API 호출 flow
- mock video result

미완료:
- 실제 영상 생성 모델/API 연결
- 실제 mp4 생성
- 생성 영상 저장소 연동
```

## 기술 스택

```text
Next.js 16
React 19
Node.js
@modelcontextprotocol/sdk
OpenAI SDK
Zod
Vanilla CSS
```

## 설치

```bash
npm install
```

## 환경 변수

로컬 MCP 서버를 사용할 때 프로젝트 루트에 `.env.local`이 필요합니다.

```text
MCP_SERVER_URL=http://127.0.0.1:8787/mcp
MCP_TRANSPORT=streamable-http
MCP_GENERATE_TOOL=generate_video
MCP_STATUS_TOOL=get_video_status
MCP_RESULT_TOOL=get_video_result
MCP_REQUEST_TIMEOUT_MS=60000
```

GPT 프롬프트 기획 기능을 사용하려면 MCP 서버를 실행하는 터미널에 아래 값도 설정합니다.

```text
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.5
```

`OPENAI_API_KEY`가 없으면 MCP 서버는 mock 모드로 동작합니다.

## 실행 방법

터미널 1: MCP 서버 실행

```bash
npm run mcp:video
```

MCP 서버 확인:

```text
http://127.0.0.1:8787/health
```

터미널 2: 프론트 서버 실행

```bash
npm run dev
```

프론트 확인:

```text
http://localhost:3000
```

Next.js에서 MCP tool 목록 확인:

```text
http://localhost:3000/api/mcp/tools
```

## 화면 라우트

```text
/          프롬프트 입력 화면
/loading   status API를 polling하는 로딩 화면
/result    result API에서 videoUrl을 확인하는 결과 화면
```

## API 라우트

```text
POST /api/generate
GET  /api/status/:jobId
GET  /api/result/:jobId
GET  /api/mcp/tools
```

관련 파일:

```text
app/api/generate/route.js
app/api/status/[jobId]/route.js
app/api/result/[jobId]/route.js
app/api/mcp/tools/route.js
```

## MCP 서버

로컬 MCP 서버 파일:

```text
server/mcp-video-server.mjs
```

MCP endpoint:

```text
http://127.0.0.1:8787/mcp
```

등록된 MCP tool:

```text
generate_video
get_video_status
get_video_result
```

현재 `generate_video`는 실제 영상 생성 모델을 호출하지 않습니다. 대신 job 객체를 만들고 샘플 mp4 URL을 반환합니다.

## 현재 동작 흐름

```text
1. 사용자가 / 화면에서 프롬프트를 입력합니다.
2. 사용자가 영상 생성 버튼을 클릭합니다.
3. HomePage.handleSubmit()이 실행됩니다.
4. createVideoGenerationPayload()가 API payload를 만듭니다.
5. 프론트가 POST /api/generate를 호출합니다.
6. app/api/generate/route.js의 POST()가 실행됩니다.
7. generateVideoWithMcp()가 MCP 서버의 generate_video tool을 호출합니다.
8. MCP 서버의 createVideoJob()이 mock job을 생성합니다.
9. /api/generate가 jobId, status, videoUrl을 프론트에 반환합니다.
10. 프론트가 sessionStorage에 job을 저장하고 /loading으로 이동합니다.
11. LoadingPage가 GET /api/status/:jobId를 호출합니다.
12. completed 상태이면 GET /api/result/:jobId를 호출합니다.
13. 최종 videoUrl을 저장하고 /result로 이동합니다.
14. ResultPage가 GET /api/result/:jobId를 다시 확인합니다.
15. video 태그가 job.videoUrl을 화면에 표시합니다.
```

## 요청 Payload 예시

```json
{
  "type": "video.generate",
  "prompt": "비 오는 네온 거리에서 모델이 천천히 걸어오는 시네마틱 패션 영상",
  "model": "neural-video-engine-v4",
  "aspect": "16:9",
  "fps": 60,
  "quality": "high",
  "duration": 8,
  "output": {
    "format": "mp4",
    "resolution": "1920x1080"
  },
  "client": {
    "source": "video-demo",
    "requestedAt": "2026-06-29T00:00:00.000Z"
  }
}
```

## 응답 예시

```json
{
  "jobId": "video-abc123",
  "status": "completed",
  "progress": 100,
  "videoUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
}
```

## 실제 모델 연결 시 해야 할 일

실제 영상 생성 모델/API가 정해지면 아래 정보가 필요합니다.

```text
모델 이름
API endpoint
인증 방식/API key
generate 요청 schema
generate 응답 schema
status 조회 방식
result 조회 방식
최종 videoUrl 반환 방식
```

이 정보가 정해지면 `server/mcp-video-server.mjs`의 mock provider 부분을 실제 provider 호출로 교체하면 됩니다.

## 참고 문서

초보자용 전체 설명:

```text
EASY_EXPLANATION.md
```

MCP 연결 가이드:

```text
docs/mcp-setup.md
```

## 주의 사항

```text
- 현재는 실제 영상 생성 서비스가 아닙니다.
- 현재 videoUrl은 샘플 mp4입니다.
- API key와 token은 클라이언트 컴포넌트에 넣지 말고 서버 환경변수로만 관리해야 합니다.
- .log 파일은 실행 중 생기는 임시 파일이며 .gitignore에 의해 Git에 올라가지 않습니다.
```

# VIDEO.AI Demo

프롬프트 기반 영상 생성 서비스 데모입니다. Next.js로 구성되어 있습니다.

현재는 실제 MCP 또는 Agent와 연결되어 있지 않고, 데모 응답과 공개 샘플 영상을 사용합니다. 실제 MCP 연동은 API 라우트 영역에 추가하면 됩니다.

## 기술 스택

- Next.js 16
- React 19
- Vanilla CSS
- App Router

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:3000
```

프로덕션 빌드 확인:

```bash
npm run build
npm start
```

## 화면 라우트

```text
/          프롬프트 입력 및 갤러리 화면
/loading   영상 생성 중 로딩 화면
/result    영상 생성 결과 화면
```

## API 라우트

```text
POST /api/generate
GET  /api/status/:jobId
GET  /api/result/:jobId
```

관련 파일:

```text
app/api/generate/route.js
app/api/status/[jobId]/route.js
app/api/result/[jobId]/route.js
```

## 프로젝트 구조

```text
app/
  page.js                    # 메인 프롬프트 화면
  loading/page.js            # 로딩/진행률 화면
  result/page.js             # 결과 화면
  components/Navigation.js   # 공통 네비게이션
  api/
    generate/route.js        # 영상 생성 요청 API
    status/[jobId]/route.js  # 작업 상태 조회 API
    result/[jobId]/route.js  # 작업 결과 조회 API
  globals.css                # 전역 스타일
  layout.js                  # 루트 레이아웃

lib/
  video-contract.js          # payload/job 공통 헬퍼
```

## 프론트 동작 흐름

1. 사용자가 `/` 화면에서 프롬프트를 입력합니다.
2. `app/page.js`에서 `createVideoGenerationPayload()`로 요청 payload를 만듭니다.
3. 프론트에서 `POST /api/generate`를 호출합니다.
4. API는 정규화된 job 객체를 반환합니다.
5. 프론트는 job 정보를 `sessionStorage`에 저장합니다.
6. `/loading` 화면으로 이동합니다.
7. 데모 진행률이 완료되면 `/result` 화면으로 이동합니다.
8. `/result`에서 프롬프트, job id, 결과 영상 URL을 표시합니다.

## 요청 Payload 예시

```json
{
  "type": "video.generate",
  "prompt": "비 오는 도심, 네온 조명 아래 모델이 천천히 걸어오는 시네마틱 패션 영상",
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
    "requestedAt": "2026-06-26T00:00:00.000Z"
  }
}
```

## 기대 응답 형식

```json
{
  "jobId": "job-123",
  "status": "processing",
  "progress": 0,
  "videoUrl": "https://example.com/result.mp4"
}
```

프론트는 `id`, `outputUrl`, `url` 형태의 응답도 받을 수 있습니다. 해당 값들은 `lib/video-contract.js`의 `normalizeVideoJob()`에서 `jobId`, `videoUrl` 형식으로 정리됩니다.

## MCP 연동 위치

실제 MCP 또는 Agent 호출 코드는 아래 파일에 추가하면 됩니다.

```text
app/api/generate/route.js
```

현재 데모 코드는 아래처럼 샘플 job을 반환합니다.

```js
const demoJob = {
  jobId: `demo-${Date.now()}`,
  status: "processing",
  videoUrl: DEMO_VIDEOS.result,
  receivedPrompt: payload.prompt,
};
```

실제 연동 시에는 이 블록을 MCP 요청 코드로 교체하면 됩니다.

연동에 필요한 기본 정보:

- MCP 서버 또는 Agent API 주소
- 연결 방식: HTTP, SSE, stdio 등
- 인증 방식
- 영상 생성 tool 또는 endpoint 이름
- 요청/응답 스키마

영상 생성이 비동기 job 방식이면 아래 정보도 필요합니다.

- 상태 조회 방식
- 결과 조회 방식
- 최종 영상 URL 반환 형식

## 참고 사항

- 현재 앱은 실제 영상 생성 서비스가 아니라 데모 셸입니다.
- API key, MCP token 같은 민감 정보는 서버 영역에만 둬야 합니다.
- Client Component 안에 인증키를 직접 넣으면 안 됩니다.

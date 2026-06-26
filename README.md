# VIDEO.AI Demo

프롬프트를 입력하면 영상을 생성하는 서비스처럼 보이도록 만든 Next.js 데모입니다.

지금은 실제 MCP 서버와 연결되어 있지 않습니다. 대신 프론트 화면, 로딩 화면, 결과 화면, 그리고 MCP 연결을 넣을 수 있는 API 자리를 만들어둔 상태입니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:3000
```

## 전체 흐름

```text
1. 사용자가 메인 화면에서 프롬프트 입력
2. 프론트가 /api/generate 로 요청 전송
3. /api/generate 가 영상 생성 job 정보를 반환
4. 화면이 /loading 으로 이동
5. 로딩 UI가 진행률을 보여준 뒤 /result 로 이동
6. /result 에서 생성된 영상과 관련 정보를 표시
```

## 파일 구조

```text
video-demo/
  app/
    page.js                    # 메인 화면: 프롬프트 입력, 영상 생성 버튼
    loading/page.js            # 로딩 화면: 생성 중 상태 표시
    result/page.js             # 결과 화면: 채팅, 영상, 관련 정보 표시
    components/Navigation.js   # 상단 로고/메뉴와 장식 아이콘
    api/generate/route.js      # 영상 생성 요청을 받는 API 자리
    api/status/[jobId]/route.js # 생성 상태 조회 API 자리
    api/result/[jobId]/route.js # 생성 결과 조회 API 자리
    globals.css                # 전체 화면 스타일
    layout.js                  # 공통 HTML 구조, 폰트 로드
  lib/
    video-contract.js          # 요청/응답 데이터 구조와 데모 영상 URL
  package.json
  next.config.mjs
```

## 프론트에서 하는 일

`app/page.js`가 사용자가 입력한 프롬프트를 받아서 payload를 만듭니다.

```js
const payload = createVideoGenerationPayload(finalPrompt, options);
```

그 다음 이 payload를 Next.js API로 보냅니다.

```js
fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
```

프론트 입장에서는 MCP를 직접 알 필요가 없습니다. 프론트는 `/api/generate`로 요청을 보내고, 응답으로 받은 `jobId`, `status`, `videoUrl`을 화면에 보여주면 됩니다.

## MCP 연결을 넣을 위치

실제 MCP 연결 코드는 `app/api/generate/route.js`에 넣으면 됩니다.

현재 코드는 데모 응답을 반환합니다.

```js
const demoJob = {
  jobId: `demo-${Date.now()}`,
  status: "processing",
  videoUrl: DEMO_VIDEOS.result,
};
```

나중에는 이 부분을 아래처럼 바꾸면 됩니다.

```text
1. MCP client 생성
2. generate_video 같은 tool 호출
3. MCP 서버에서 받은 jobId/status/videoUrl 반환
```

예상 구조:

```text
브라우저 화면
  ↓
/api/generate
  ↓
Node.js 서버 코드
  ↓
MCP 서버 또는 Agent API
  ↓
영상 생성 job/result
```

## 요청 payload 예시

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

## 응답 형식

프론트는 아래 형식이면 바로 처리할 수 있습니다.

```json
{
  "jobId": "job-123",
  "status": "processing",
  "progress": 0,
  "videoUrl": "https://example.com/result.mp4"
}
```

응답 키가 `id`, `outputUrl`, `url`처럼 달라도 `lib/video-contract.js`의 `normalizeVideoJob()`에서 기본적으로 맞춰줍니다.

## 백엔드 개발자가 확인할 부분

- 실제 MCP 서버 주소
- MCP 연결 방식: stdio, SSE, HTTP 중 무엇인지
- 인증키 또는 토큰 관리 방식
- 영상 생성 요청 tool 이름
- 생성 상태를 조회하는 방식
- 최종 영상 URL을 받는 방식

이 값들이 정해지면 `app/api/generate/route.js`, `app/api/status/[jobId]/route.js`, `app/api/result/[jobId]/route.js`에 실제 연결 코드를 넣으면 됩니다.

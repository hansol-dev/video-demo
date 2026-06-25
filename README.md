# Video Demo Frontend

프롬프트 기반 영상 생성 서비스의 정적 프론트 데모입니다. 실제 영상 생성은 포함하지 않고, 백엔드 또는 MCP 브릿지를 붙일 수 있는 연결 지점만 준비되어 있습니다.

## 파일 구조

```text
video-demo/
  index.html                  # 프롬프트 입력 화면
  loading.html                # 생성 중 로딩 화면
  result.html                 # 생성 결과 화면
  styles.css                  # 공통 스타일
  app.js                      # 화면 흐름, payload 생성, 연결 함수
  mcp-integration.example.js  # MCP/API 연결 예시
```

## 화면 흐름

```text
index.html
  -> 영상 생성하기 클릭
  -> createVideoGenerationPayload()
  -> requestVideoGeneration()
  -> loading.html
  -> result.html
```

## 백엔드/MCP 연결 지점

`app.js`의 `requestVideoGeneration(payload)` 함수만 보면 됩니다.

현재 우선순위는 아래와 같습니다.

1. `window.videoGenerationMcp.generateVideo(payload)`가 있으면 호출
2. `window.VIDEO_GENERATE_ENDPOINT`가 있으면 `fetch()` 호출
3. 둘 다 없으면 데모 응답 반환

## payload 예시

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
    "requestedAt": "2026-06-25T00:00:00.000Z"
  }
}
```

## 응답 규격

```json
{
  "jobId": "job-123",
  "status": "processing",
  "videoUrl": "https://example.com/result.mp4"
}
```

`id`, `outputUrl`, `url`로 내려와도 `normalizeVideoJob()`에서 맞춰줍니다.

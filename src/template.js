// 성미산 FAQ 위젯의 스타일과 공통 헬퍼.
// CSS는 기존 sungmisan-faq-ghost.html 의 <style> 블록을 그대로 옮겨온 것으로,
// 출력 결과가 현재 홈페이지 FAQ 디자인과 100% 일치하도록 유지합니다.
// .smwiki 로 스코프되어 Ghost 테마와 충돌하지 않습니다.

export const FAQ_CSS = `
    .smwiki{--smw-green:#4a7c3a;--smw-bg:#f6f8f3;--smw-card:#ffffff;--smw-line:#e3e8dc;--smw-text:#2b3326;--smw-muted:#6b7563;color:var(--smw-text);line-height:1.7;}
    /* 테마가 제목 등에 강제로 입히는 폰트를 덮어써, 위젯 전체를 사이트 본문과 동일한 글꼴로 통일 */
    .smwiki, .smwiki *{font-family:-apple-system,system-ui,"Apple SD Gothic Neo",Pretendard,"Malgun Gothic","맑은 고딕",sans-serif !important;}
    .smwiki *{box-sizing:border-box;}
    .smwiki .smw-section{margin:8px 0 16px;}
    .smwiki .smw-section h2{display:inline-block;font-size:1.4em;margin:0;padding:9px 20px;border-radius:10px;background:var(--smw-green);color:#fff;}
    .smwiki .smw-cat{display:inline-block;font-size:1.2em;font-weight:700;margin:28px 0 10px;padding:8px 16px;border-radius:10px;background:var(--smw-bg);color:var(--smw-text);border-left:5px solid var(--smw-green);}
    .smwiki details{background:var(--smw-card);border:1px solid var(--smw-line);border-radius:12px;margin:10px 0;overflow:hidden;transition:border-color .2s;}
    .smwiki details[open]{border-color:var(--smw-green);}
    .smwiki summary{cursor:pointer;list-style:none;padding:16px 20px;font-weight:600;font-size:1.12em;display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--smw-bg);}
    .smwiki summary::-webkit-details-marker{display:none;}
    .smwiki summary::after{content:"+";font-size:1.5em;color:var(--smw-green);font-weight:400;flex:0 0 auto;}
    .smwiki details[open] summary::after{content:"–";}
    .smwiki .smw-a{padding:6px 20px 18px;}
    .smwiki .smw-a p{margin:12px 0;font-size:1em;}
    .smwiki table{width:100%;border-collapse:collapse;margin:14px 0;font-size:.95em;}
    .smwiki th,.smwiki td{border:1px solid var(--smw-line);padding:9px 12px;text-align:center;}
    .smwiki th{background:var(--smw-green);color:#fff;font-weight:600;}
    .smwiki tbody tr:nth-child(even){background:var(--smw-bg);}
    .smwiki .smw-note{font-size:.9em;color:var(--smw-muted);margin-top:6px;}
    @media (max-width:600px){.smwiki .smw-hero h1{font-size:1.6em;}.smwiki table{font-size:.88em;}.smwiki th,.smwiki td{padding:7px 6px;}}
`;

// HTML 텍스트 노드 이스케이프 (< > & " 를 안전하게)
export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 구조화 모델(JSON) → .smwiki HTML 조각을 생성합니다.
// 출력물은 기존 sungmisan-faq-ghost.html 과 동일한 마크업이라,
// Ghost 페이지에 주입되면 현재 디자인 그대로 렌더링됩니다.
//
// 모델 형태:
// {
//   "blocks": [
//     { "type": "banner",   "title": "★ 공동육아 FAQ BEST 5 ★" },
//     { "type": "category", "title": "3️⃣ 아이들의 하루" },
//     { "type": "qa", "question": "...", "open": false, "answer": [
//         { "type": "p",    "text": "🌱 : ..." },   // 또는 { "type":"p", "html":"..." }
//         { "type": "note", "text": "※ ..." },
//         { "type": "table", "head": [["열1","열2"]], "rows": [["a","b"],["c","d"]] }
//     ]}
//   ]
// }

import { FAQ_CSS, esc } from "./template.js";

// answer 하위 블록에서 텍스트를 뽑아 안전한 HTML로 변환.
// html 필드가 있으면(=노션에서 서식 포함해 미리 만든 경우) 그대로, 없으면 text 를 이스케이프.
function inline(block) {
  if (block.html != null) return block.html;
  return esc(block.text);
}

function renderTable(t) {
  const head = Array.isArray(t.head) ? t.head : [];
  const rows = Array.isArray(t.rows) ? t.rows : [];
  let html = "      <table>\n";
  if (head.length) {
    html += "        <thead>\n";
    for (const hr of head) {
      html += "          <tr>" + hr.map((c) => `<th>${cell(c)}</th>`).join("") + "</tr>\n";
    }
    html += "        </thead>\n";
  }
  html += "        <tbody>\n";
  for (const r of rows) {
    html += "          <tr>" + r.map((c) => `<td>${cell(c)}</td>`).join("") + "</tr>\n";
  }
  html += "        </tbody>\n      </table>\n";
  return html;
}

// 표 셀: 문자열이면 이스케이프, {html} 또는 {text} 객체도 허용
function cell(c) {
  if (c && typeof c === "object") return c.html != null ? c.html : esc(c.text);
  return esc(c);
}

function renderAnswer(answer) {
  const parts = [];
  for (const b of answer || []) {
    if (b.type === "table") {
      parts.push(renderTable(b));
    } else if (b.type === "note") {
      parts.push(`      <p class="smw-note">${inline(b)}</p>\n`);
    } else {
      // 기본: 문단
      parts.push(`      <p>${inline(b)}</p>\n`);
    }
  }
  return parts.join("");
}

function renderBlock(block) {
  switch (block.type) {
    case "banner":
      return `\n  <div class="smw-section"><h2>${esc(block.title)}</h2></div>\n`;
    case "category":
      return `\n  <div class="smw-cat">${esc(block.title)}</div>\n`;
    case "qa": {
      const openAttr = block.open ? " open" : "";
      return (
        `\n  <details${openAttr}>\n` +
        `    <summary>${inline({ text: block.question, html: block.questionHtml })}</summary>\n` +
        `    <div class="smw-a">\n` +
        renderAnswer(block.answer) +
        `    </div>\n` +
        `  </details>\n`
      );
    }
    default:
      return "";
  }
}

// 모델 → 전체 .smwiki 위젯 HTML (self-contained: 스타일 포함)
export function renderFaq(model) {
  const blocks = (model && model.blocks) || [];
  const body = blocks.map(renderBlock).join("");
  return (
    `<!-- 자동 생성됨: sungmisan-faq-sync. 직접 수정하지 마세요 (노션에서 편집) -->\n` +
    `<div class="smwiki">\n` +
    `  <style>${FAQ_CSS}  </style>\n` +
    body +
    `</div>\n`
  );
}

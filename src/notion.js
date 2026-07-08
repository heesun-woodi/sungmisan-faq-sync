// 노션 페이지(텍스트 + 토글)를 읽어 구조화 모델로 변환합니다.
//
// 매핑 규칙 (첫 연결 시 `npm run inspect` 로 실제 구조를 확인해 조정하세요):
//   - Heading 1            → banner   (큰 초록 섹션 바)   예: "★ 공동육아 FAQ BEST 5 ★"
//   - Heading 2 / Heading 3→ category (연초록 카테고리 칩) 예: "3️⃣ 아이들의 하루"
//   - Toggle               → qa       (아코디언 질문/답변)
//       · 토글 제목        → 질문(summary)
//       · 토글 내부 블록   → 답변: paragraph→<p>, table→표, ※·주n) 로 시작하면 각주(note)
//
// 규칙을 바꾸려면 아래 MAP 설정만 수정하면 됩니다.

import { Client } from "@notionhq/client";
import { esc } from "./template.js";

const MAP = {
  banner: ["heading_1"],
  category: ["heading_2", "heading_3"],
  qa: ["toggle"],
};

// 노션 rich_text 배열 → 안전한 인라인 HTML (굵게/기울임/코드/링크 지원, 그 외는 평문)
function inlineHtml(richText = []) {
  return richText
    .map((t) => {
      let h = esc(t.plain_text);
      const a = t.annotations || {};
      if (a.code) h = `<code>${h}</code>`;
      if (a.bold) h = `<strong>${h}</strong>`;
      if (a.italic) h = `<em>${h}</em>`;
      if (a.underline) h = `<u>${h}</u>`;
      if (t.href) h = `<a href="${esc(t.href)}" target="_blank" rel="noopener">${h}</a>`;
      return h;
    })
    .join("");
}

function plainText(richText = []) {
  return richText.map((t) => t.plain_text).join("");
}

// 페이지/블록의 모든 자식 블록을 페이지네이션 포함해 가져오기
async function listAllChildren(notion, blockId) {
  const out = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    out.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}

function typeGroup(notionType) {
  for (const [group, types] of Object.entries(MAP)) {
    if (types.includes(notionType)) return group;
  }
  return null;
}

// 각주(note) 판별: ※ 또는 "주1)" 같은 접두로 시작하는 문단
function isNote(text) {
  return /^\s*(※|주\s*\d*\s*\))/.test(text);
}

// 토글 내부 블록들 → answer 배열
async function mapAnswer(notion, children) {
  const answer = [];
  for (const b of children) {
    if (b.type === "paragraph") {
      const rt = b.paragraph.rich_text;
      if (!rt.length) continue; // 빈 줄 skip
      const text = plainText(rt);
      answer.push({ type: isNote(text) ? "note" : "p", html: inlineHtml(rt) });
    } else if (b.type === "bulleted_list_item") {
      answer.push({ type: "p", html: "• " + inlineHtml(b.bulleted_list_item.rich_text) });
    } else if (b.type === "numbered_list_item") {
      answer.push({ type: "p", html: inlineHtml(b.numbered_list_item.rich_text) });
    } else if (b.type === "table") {
      answer.push(await mapTable(notion, b));
    } else if (b.type === "callout") {
      answer.push({ type: "note", html: inlineHtml(b.callout.rich_text) });
    }
    // 그 외 타입(이미지 등)은 현재 무시 — 필요 시 확장
  }
  return answer;
}

async function mapTable(notion, tableBlock) {
  const hasHeader = tableBlock.table?.has_column_header;
  const rowBlocks = await listAllChildren(notion, tableBlock.id);
  const rows = rowBlocks
    .filter((r) => r.type === "table_row")
    .map((r) => r.table_row.cells.map((cellRt) => ({ html: inlineHtml(cellRt) })));
  if (hasHeader && rows.length) {
    return { type: "table", head: [rows[0]], rows: rows.slice(1) };
  }
  return { type: "table", head: [], rows };
}

// 노션 루트 페이지 → 모델
export async function fetchModelFromNotion(token, rootPageId) {
  const notion = new Client({ auth: token });
  const top = await listAllChildren(notion, rootPageId);
  const blocks = [];

  let firstQa = true;
  for (const b of top) {
    const group = typeGroup(b.type);
    if (group === "banner") {
      blocks.push({ type: "banner", title: plainText(b[b.type].rich_text) });
    } else if (group === "category") {
      blocks.push({ type: "category", title: plainText(b[b.type].rich_text) });
    } else if (group === "qa") {
      const children = b.has_children ? await listAllChildren(notion, b.id) : [];
      // 토글 제목에 줄바꿈으로 답변이 섞여 들어간 경우(노션 입력 실수) 자동 분리:
      // 첫 줄 = 질문, 나머지 줄 = 답변 앞부분 문단.
      const titleLines = plainText(b.toggle.rich_text)
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const question = titleLines[0] || "";
      const spilledParas = titleLines.slice(1).map((t) => ({
        type: isNote(t) ? "note" : "p",
        html: esc(t),
      }));
      blocks.push({
        type: "qa",
        question,
        questionHtml: esc(question),
        open: firstQa, // 첫 질문만 펼친 상태 (현재 홈페이지 UX와 동일)
        answer: [...spilledParas, ...(await mapAnswer(notion, children))],
      });
      firstQa = false;
    }
    // 최상위의 일반 문단/구분선 등은 무시
  }

  return { blocks };
}

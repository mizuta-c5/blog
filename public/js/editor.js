// src/client/editor.ts
import MarkdownIt from "markdown-it";
var md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true
});
var ta = document.getElementById("md");
var pv = document.getElementById("preview");
var render = () => {
  if (!pv) return;
  pv.innerHTML = md.render(ta?.value || "");
};
render();
if (ta) {
  ta.addEventListener("input", render);
}
//# sourceMappingURL=editor.js.map
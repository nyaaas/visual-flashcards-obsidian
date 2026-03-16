'use strict';

var obsidian = require('obsidian');

const VIEW_TYPE_FLASHCARD = "flashcard-view";

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function parseFlashcards(content) {
  const cards = [];
  const lines = content.split('\n');
  let front = null;
  let backLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Q:')) {
      if (front !== null && backLines.length > 0) {
        const back = backLines.join(' ').trim();
        if (back) cards.push({ front, back, id: hashString(front) });
      }
      front = trimmed.slice(2).trim();
      backLines = [];
    } else if (trimmed.startsWith('A:') && front !== null) {
      backLines.push(trimmed.slice(2).trim());
    } else if (trimmed && front !== null && backLines.length > 0) {
      backLines.push(trimmed);
    }
  }

  if (front !== null && backLines.length > 0) {
    const back = backLines.join(' ').trim();
    if (back) cards.push({ front, back, id: hashString(front) });
  }

  return cards;
}

const STYLES = `
.fc-root { height:100%; overflow-y:auto; background:var(--background-primary); }
.fc-wrap { display:flex; flex-direction:column; gap:12px; padding:16px; max-width:480px; margin:0 auto; font-family:var(--font-interface); }
.fc-header { display:flex; align-items:center; justify-content:space-between; }
.fc-title { font-size:15px; font-weight:700; letter-spacing:0.05em; color:var(--text-accent); }
.fc-empty { text-align:center; padding:48px 16px; color:var(--text-muted); }
.fc-empty-icon { font-size:48px; margin-bottom:12px; opacity:0.3; }
.fc-empty-hint { font-size:12px; opacity:0.6; margin:2px 0; }
.fc-picker-wrap { display:flex; gap:8px; align-items:center; }
.fc-picker { flex:1; padding:6px 10px; border-radius:8px; border:1.5px solid var(--background-modifier-border); background:var(--background-secondary); color:var(--text-normal); font-size:12px; font-family:var(--font-interface); cursor:pointer; }
.fc-picker:focus { outline:none; border-color:var(--text-accent); }
.fc-progress-wrap { display:flex; align-items:center; gap:10px; }
.fc-prog-label { font-size:11px; color:var(--text-muted); white-space:nowrap; min-width:38px; }
.fc-progress-bar { flex:1; height:5px; border-radius:99px; background:var(--background-modifier-border); overflow:hidden; }
.fc-progress-fill { height:100%; background:var(--text-accent); border-radius:99px; transition:width 0.4s ease; }
.fc-score-row { display:flex; gap:12px; }
.fc-score { font-size:12px; font-weight:600; padding:3px 10px; border-radius:99px; }
.fc-score-correct { background:rgba(68,207,110,0.15); color:#44cf6e; }
.fc-score-incorrect { background:rgba(240,80,80,0.15); color:#f05050; }
.fc-card-area { perspective:1000px; width:100%; }
.fc-card-scene { width:100%; }
.fc-card { width:100%; min-height:220px; position:relative; transform-style:preserve-3d; transition:transform 0.5s cubic-bezier(0.4,0,0.2,1); cursor:pointer; }
.fc-card-flipped { transform:rotateY(180deg); }
.fc-card-face { position:absolute; width:100%; min-height:220px; border-radius:16px; padding:28px 24px 20px; box-sizing:border-box; backface-visibility:hidden; -webkit-backface-visibility:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.18),0 2px 8px rgba(0,0,0,0.10); }
.fc-card-front { background:var(--background-secondary); border:1.5px solid var(--background-modifier-border); }
.fc-card-back { background:var(--background-secondary-alt,var(--background-secondary)); border:1.5px solid var(--text-accent); transform:rotateY(180deg); }
.fc-face-label { font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:var(--text-muted); font-weight:600; }
.fc-card-text { font-size:16px; font-weight:500; line-height:1.5; color:var(--text-normal); margin:0; padding:0; }
.fc-tap-hint { font-size:10px; color:var(--text-faint); letter-spacing:0.06em; margin-top:auto; }
.fc-actions { display:flex; gap:10px; opacity:0; pointer-events:none; transform:translateY(6px); transition:opacity 0.3s ease,transform 0.3s ease; }
.fc-actions-visible { opacity:1; pointer-events:all; transform:translateY(0); }
.fc-nav { display:flex; align-items:center; justify-content:center; gap:20px; }
.fc-nav-btn { width:36px; height:36px; border-radius:50%; border:1.5px solid var(--background-modifier-border); background:var(--background-secondary); color:var(--text-normal); cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; transition:background 0.2s,border-color 0.2s; }
.fc-nav-btn:disabled { opacity:0.3; cursor:not-allowed; }
.fc-nav-btn:not(:disabled):hover { background:var(--background-modifier-hover); border-color:var(--text-accent); }
.fc-nav-counter { font-size:13px; color:var(--text-muted); min-width:55px; text-align:center; }
.fc-tools { display:flex; gap:8px; justify-content:center; }
.fc-btn { padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-size:13px; font-weight:600; transition:opacity 0.2s,transform 0.1s; }
.fc-btn:hover { opacity:0.85; }
.fc-btn:active { transform:scale(0.97); }
.fc-btn-load { background:var(--interactive-accent); color:var(--text-on-accent); font-size:12px; padding:6px 12px; white-space:nowrap; }
.fc-btn-wrong { flex:1; background:rgba(240,80,80,0.12); color:#f05050; border:1.5px solid rgba(240,80,80,0.25); }
.fc-btn-right { flex:1; background:rgba(68,207,110,0.12); color:#44cf6e; border:1.5px solid rgba(68,207,110,0.25); }
.fc-tool-btn { padding:6px 14px; border-radius:8px; border:1.5px solid var(--background-modifier-border); background:transparent; color:var(--text-muted); cursor:pointer; font-size:12px; transition:background 0.2s,color 0.2s; }
.fc-tool-btn:hover { background:var(--background-modifier-hover); color:var(--text-normal); }
.fc-debug { font-size:10px; color:var(--text-muted); text-align:center; padding:4px; word-break:break-all; }
.fc-end { display:flex; flex-direction:column; gap:16px; }
.fc-end-score { text-align:center; padding:24px; background:var(--background-secondary); border-radius:16px; border:1.5px solid var(--background-modifier-border); }
.fc-end-percent { font-size:48px; font-weight:700; color:var(--text-accent); line-height:1; }
.fc-end-label { font-size:12px; color:var(--text-muted); margin-top:6px; }
.fc-end-breakdown { display:flex; gap:10px; justify-content:center; margin-top:12px; }
.fc-end-history { background:var(--background-secondary); border-radius:12px; padding:14px; border:1.5px solid var(--background-modifier-border); }
.fc-end-history-title { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--text-muted); margin-bottom:10px; }
.fc-history-row { display:flex; align-items:center; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--background-modifier-border); font-size:12px; }
.fc-history-row:last-child { border-bottom:none; }
.fc-history-date { color:var(--text-muted); }
.fc-history-pct { font-weight:600; }
.fc-missed { background:var(--background-secondary); border-radius:12px; padding:14px; border:1.5px solid rgba(240,80,80,0.25); }
.fc-missed-title { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#f05050; margin-bottom:10px; }
.fc-missed-item { font-size:12px; color:var(--text-muted); padding:4px 0; border-bottom:1px solid var(--background-modifier-border); line-height:1.4; }
.fc-missed-item:last-child { border-bottom:none; }
.fc-end-btns { display:flex; gap:8px; }
`;

class FlashcardView extends obsidian.ItemView {
  constructor(leaf) {
    super(leaf);
    this.cards = [];
    this.currentIndex = 0;
    this.isFlipped = false;
    this.score = { correct: 0, incorrect: 0 };
    this.studied = new Set();
    this.missedCards = [];
    this.lastLoadedFile = null;
    this.selectedPath = null;
    this.showEndScreen = false;
    this.plugin = null;
    this.allMarkdownFiles = [];
  }

  getViewType() { return VIEW_TYPE_FLASHCARD; }
  getDisplayText() { return "Flashcards"; }
  getIcon() { return "layers"; }

  async onOpen() {
    this.refreshFileList();
    this.renderUI();
  }

  refreshFileList() {
    this.allMarkdownFiles = this.app.vault.getMarkdownFiles()
    .sort((a, b) => a.path.localeCompare(b.path));
  }

  async loadFromPath(path) {
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!file) {
      new obsidian.Notice("❌ Could not find file: " + path);
      return;
    }

    let content;
    try {
      content = await this.app.vault.read(file);
    } catch (e) {
      new obsidian.Notice("❌ Could not read: " + path);
      return;
    }

    this.lastLoadedFile = file.name;
    this.selectedPath = path;
    this.cards = parseFlashcards(content);

    if (this.cards.length === 0) {
      new obsidian.Notice(`❌ No flashcards in "${file.name}". Use Q: / A: format.`);
      this.renderUI();
      return;
    }

    this.currentIndex = 0;
    this.isFlipped = false;
    this.score = { correct: 0, incorrect: 0 };
    this.studied = new Set();
    this.missedCards = [];
    this.showEndScreen = false;
    this.renderUI();
    new obsidian.Notice(`✓ Loaded ${this.cards.length} cards from "${file.name}"`);
  }

  async saveScore() {
    if (!this.plugin || !this.lastLoadedFile) return;
    const total = this.score.correct + this.score.incorrect;
    if (total === 0) return;
    const pct = Math.round((this.score.correct / total) * 100);
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    let data = await this.plugin.loadData() || {};
    if (!data[this.lastLoadedFile]) data[this.lastLoadedFile] = [];
    data[this.lastLoadedFile].unshift({ date, pct, correct: this.score.correct, total });
    if (data[this.lastLoadedFile].length > 10) data[this.lastLoadedFile] = data[this.lastLoadedFile].slice(0, 10);
    await this.plugin.saveData(data);
  }

  async getHistory() {
    if (!this.plugin || !this.lastLoadedFile) return [];
    const data = await this.plugin.loadData() || {};
    return data[this.lastLoadedFile] || [];
  }

  async showEnd() {
    this.showEndScreen = true;
    await this.saveScore();
    this.renderUI();
  }

  async renderUI() {
    const container = this.containerEl;
    container.empty();
    container.addClass("fc-root");

    const style = container.createEl("style");
    style.textContent = STYLES;

    const wrap = container.createDiv({ cls: "fc-wrap" });

    const header = wrap.createDiv({ cls: "fc-header" });
    header.createEl("span", { cls: "fc-title", text: "✦ Flashcards" });

    this.refreshFileList();
    const pickerWrap = wrap.createDiv({ cls: "fc-picker-wrap" });
    const select = pickerWrap.createEl("select", { cls: "fc-picker" });

    const placeholder = select.createEl("option", { text: "— choose a note —" });
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = !this.selectedPath;

    this.allMarkdownFiles.forEach(file => {
      const opt = select.createEl("option", { text: file.name, value: file.path });
      if (file.path === this.selectedPath) opt.selected = true;
    });

      const loadBtn = pickerWrap.createEl("button", { cls: "fc-btn fc-btn-load", text: "Load" });
      loadBtn.onclick = () => {
        if (select.value) {
          this.loadFromPath(select.value);
        } else {
          new obsidian.Notice("Pick a note first!");
        }
      };

      if (this.cards.length === 0) {
        const empty = wrap.createDiv({ cls: "fc-empty" });
        empty.createEl("div", { cls: "fc-empty-icon", text: "⬡" });
        empty.createEl("p", { text: "No cards loaded yet." });
        empty.createEl("p", { cls: "fc-empty-hint", text: "Pick a note above and click Load" });
        empty.createEl("p", { cls: "fc-empty-hint", text: "Format: Q: question / A: answer" });
        return;
      }

      if (this.showEndScreen) {
        await this.renderEndScreen(wrap);
        return;
      }

      if (this.lastLoadedFile) {
        wrap.createEl("div", { cls: "fc-debug", text: `📄 ${this.lastLoadedFile}` });
      }

      const studied = this.studied.size;
      const total = this.cards.length;

      const prog = wrap.createDiv({ cls: "fc-progress-wrap" });
      prog.createEl("span", { cls: "fc-prog-label", text: `${studied} / ${total}` });
      const bar = prog.createDiv({ cls: "fc-progress-bar" });
      const fill = bar.createDiv({ cls: "fc-progress-fill" });
      fill.style.width = `${total > 0 ? (studied / total) * 100 : 0}%`;

      const scoreRow = wrap.createDiv({ cls: "fc-score-row" });
      scoreRow.createEl("span", { cls: "fc-score fc-score-correct", text: `✓ ${this.score.correct}` });
      scoreRow.createEl("span", { cls: "fc-score fc-score-incorrect", text: `✗ ${this.score.incorrect}` });

      const cardArea = wrap.createDiv({ cls: "fc-card-area" });
      const cardScene = cardArea.createDiv({ cls: "fc-card-scene" });
      const card = cardScene.createDiv({ cls: "fc-card" + (this.isFlipped ? " fc-card-flipped" : "") });

      const front = card.createDiv({ cls: "fc-card-face fc-card-front" });
      front.createEl("span", { cls: "fc-face-label", text: "Question" });
      front.createEl("p", { cls: "fc-card-text", text: this.cards[this.currentIndex].front });
      front.createEl("span", { cls: "fc-tap-hint", text: "tap to reveal" });

      const back = card.createDiv({ cls: "fc-card-face fc-card-back" });
      back.createEl("span", { cls: "fc-face-label", text: "Answer" });
      back.createEl("p", { cls: "fc-card-text", text: this.cards[this.currentIndex].back });

      card.onclick = () => {
        this.isFlipped = !this.isFlipped;
        this.studied.add(this.cards[this.currentIndex].id);
        this.renderUI();
      };

      const actions = wrap.createDiv({ cls: "fc-actions" + (this.isFlipped ? " fc-actions-visible" : "") });
      const wrongBtn = actions.createEl("button", { cls: "fc-btn fc-btn-wrong", text: "✗  Missed it" });
      wrongBtn.onclick = () => {
        this.missedCards.push(this.cards[this.currentIndex]);
        this.score.incorrect++;
        this.nextOrEnd();
      };
      const rightBtn = actions.createEl("button", { cls: "fc-btn fc-btn-right", text: "✓  Got it!" });
      rightBtn.onclick = () => {
        this.score.correct++;
        this.nextOrEnd();
      };

      const nav = wrap.createDiv({ cls: "fc-nav" });
      const prevBtn = nav.createEl("button", { cls: "fc-nav-btn", text: "←" });
      prevBtn.disabled = this.currentIndex === 0;
      prevBtn.onclick = () => this.prev();
      nav.createEl("span", { cls: "fc-nav-counter", text: `${this.currentIndex + 1} / ${total}` });
      const nextBtn = nav.createEl("button", { cls: "fc-nav-btn", text: "→" });
      nextBtn.disabled = this.currentIndex === total - 1;
      nextBtn.onclick = () => this.next();

      const tools = wrap.createDiv({ cls: "fc-tools" });
      const shuffleBtn = tools.createEl("button", { cls: "fc-tool-btn", text: "⇌  Shuffle" });
      shuffleBtn.onclick = () => {
        this.cards = this.cards.sort(() => Math.random() - 0.5);
        this.currentIndex = 0; this.isFlipped = false; this.renderUI();
      };
      const restartBtn = tools.createEl("button", { cls: "fc-tool-btn", text: "↺  Restart" });
      restartBtn.onclick = () => {
        this.currentIndex = 0; this.isFlipped = false;
        this.score = { correct: 0, incorrect: 0 };
        this.studied = new Set(); this.missedCards = [];
        this.showEndScreen = false;
        this.renderUI();
      };
  }

  async renderEndScreen(wrap) {
    const total = this.score.correct + this.score.incorrect;
    const pct = total > 0 ? Math.round((this.score.correct / total) * 100) : 0;
    const history = await this.getHistory();

    const end = wrap.createDiv({ cls: "fc-end" });

    const scoreBox = end.createDiv({ cls: "fc-end-score" });
    scoreBox.createEl("div", { cls: "fc-end-percent", text: `${pct}%` });
    scoreBox.createEl("div", { cls: "fc-end-label", text: `${this.score.correct} correct out of ${total}` });
    const breakdown = scoreBox.createDiv({ cls: "fc-end-breakdown" });
    breakdown.createEl("span", { cls: "fc-score fc-score-correct", text: `✓ ${this.score.correct}` });
    breakdown.createEl("span", { cls: "fc-score fc-score-incorrect", text: `✗ ${this.score.incorrect}` });

    if (this.missedCards.length > 0) {
      const missed = end.createDiv({ cls: "fc-missed" });
      missed.createEl("div", { cls: "fc-missed-title", text: "📝 Needs practice" });
      this.missedCards.forEach(card => {
        missed.createEl("div", { cls: "fc-missed-item", text: card.front });
      });
    }

    if (history.length > 1) {
      const hist = end.createDiv({ cls: "fc-end-history" });
      hist.createEl("div", { cls: "fc-end-history-title", text: "📈 Past sessions" });
      history.forEach((entry, i) => {
        const row = hist.createDiv({ cls: "fc-history-row" });
        row.createEl("span", { cls: "fc-history-date", text: i === 0 ? `${entry.date} (today)` : entry.date });
        row.createEl("span", { cls: "fc-history-pct", text: `${entry.pct}% (${entry.correct}/${entry.total})` });
      });
    }

    const btns = end.createDiv({ cls: "fc-end-btns" });

    if (this.missedCards.length > 0) {
      const retryBtn = btns.createEl("button", { cls: "fc-btn fc-btn-wrong", text: "↺  Retry missed" });
      retryBtn.onclick = () => {
        this.cards = [...this.missedCards];
        this.currentIndex = 0; this.isFlipped = false;
        this.score = { correct: 0, incorrect: 0 };
        this.studied = new Set(); this.missedCards = [];
        this.showEndScreen = false;
        this.renderUI();
      };
    }

    const restartBtn = btns.createEl("button", { cls: "fc-btn fc-btn-right", text: "↺  Start over" });
    restartBtn.onclick = () => {
      this.currentIndex = 0; this.isFlipped = false;
      this.score = { correct: 0, incorrect: 0 };
      this.studied = new Set(); this.missedCards = [];
      this.showEndScreen = false;
      this.renderUI();
    };
  }

  nextOrEnd() {
    if (this.currentIndex === this.cards.length - 1) {
      this.showEnd();
    } else {
      this.next();
    }
  }

  next() {
    if (this.currentIndex < this.cards.length - 1) {
      this.currentIndex++; this.isFlipped = false; this.renderUI();
    }
  }
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--; this.isFlipped = false; this.renderUI();
    }
  }

  async onClose() {}
}

class FlashcardPlugin extends obsidian.Plugin {
  async onload() {
    this.registerView(VIEW_TYPE_FLASHCARD, (leaf) => {
      const view = new FlashcardView(leaf);
      view.plugin = this;
      return view;
    });
    this.addRibbonIcon("layers", "Open Flashcards", () => { this.activateView(); });
    this.addCommand({
      id: "open-flashcard-view",
      name: "Open Flashcard View",
      callback: () => this.activateView(),
    });
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_FLASHCARD)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE_FLASHCARD, active: true });
    }
    workspace.revealLeaf(leaf);
  }

  async onunload() {}
}

module.exports = FlashcardPlugin;
